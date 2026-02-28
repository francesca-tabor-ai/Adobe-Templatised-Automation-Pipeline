#!/usr/bin/env node
/**
 * CGVIP pipeline runner: runs agents in order (Dataset Governance → Compliance → Template Compatibility → Render),
 * writes audit log, then delegates to existing runner and writes job manifest.
 * Usage: node run_cgvip_pipeline.js --path indesign|photoshop|aftereffects [--dataset path] [--approved-only] [--config path]
 *        node run_cgvip_pipeline.js --post-render [--path app]  (Phase 2: run QA aggregate + QA agent)
 *        node run_cgvip_pipeline.js --performance [--suppress-from-performance] (Phase 3: performance intelligence)
 */

const path = require('path');
const fs = require('fs');

const REPO_ROOT = path.resolve(__dirname, '..');
const { filterAndWrite } = require('./src/approval_filter');
const { getRunInstructions, writeRunConfig } = require('./src/runner');
const { aggregateQA, writeReport } = require('./src/qa_aggregate');
const { runAgent } = require('./agents/common/contract');
const { appendAuditEntry, generateRunId } = require('./agents/common/audit');

function loadConfig(configPath) {
  const p = configPath || path.join(REPO_ROOT, 'config/defaults.json');
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { path: null, dataset: null, approvedOnly: false, config: null, postRender: false, qaOnly: false, performance: false, suppressFromPerformance: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--path' && args[i + 1]) {
      out.path = args[++i].toLowerCase();
    } else if (args[i] === '--dataset' && args[i + 1]) {
      out.dataset = args[++i];
    } else if (args[i] === '--approved-only') {
      out.approvedOnly = true;
    } else if (args[i] === '--config' && args[i + 1]) {
      out.config = args[++i];
    } else if (args[i] === '--post-render') {
      out.postRender = true;
    } else if (args[i] === '--qa-only') {
      out.qaOnly = true;
    } else if (args[i] === '--performance') {
      out.performance = true;
    } else if (args[i] === '--suppress-from-performance') {
      out.suppressFromPerformance = true;
    }
  }
  return out;
}

function loadDataset(dataPath, appPath, approvedOnly) {
  const isCSV = appPath === 'indesign';
  const dataFile = dataPath || path.join(REPO_ROOT, 'data/sample', isCSV ? 'variants.csv' : 'variants.json');
  if (!fs.existsSync(dataFile)) {
    return { records: [], dataPath: null, error: `Data file not found: ${dataFile}` };
  }
  const text = fs.readFileSync(dataFile, 'utf8');
  const isJSON = /\.json$/i.test(dataFile);
  let records = isJSON ? JSON.parse(text) : require('./src/approval_filter').parseCSV(text);
  if (!Array.isArray(records)) records = [records];
  const originalCount = records.length;
  if (approvedOnly) {
    records = records.filter(r => {
      const v = r.approved;
      if (typeof v === 'boolean') return v;
      if (typeof v === 'string') return v.toLowerCase() === 'true' || v === '1';
      return Boolean(v);
    });
  }
  return { records, dataPath: dataFile, originalCount, filteredCount: records.length };
}

async function main() {
  const opts = parseArgs();
  const config = loadConfig(opts.config);
  const dataDir = (config.paths && config.paths.dataDir) || path.join(REPO_ROOT, 'data/sample');
  const outputDir = (config.paths && config.paths.outputDir) || path.join(REPO_ROOT, 'output');

  if (opts.qaOnly) {
    const report = aggregateQA();
    writeReport(report);
    console.log('QA report:', report.passed, 'passed,', report.failed, 'failed');
    return;
  }

  if (opts.postRender) {
    const report = aggregateQA();
    writeReport(report);
    const runId = generateRunId();
    try {
      const qaAgent = require('./agents/qa_risk');
      const result = qaAgent.run({ report, failures: report.failures }, { runId });
      appendAuditEntry({
        runId,
        agentId: 'qa_risk',
        approvalState: result.approvalState || (result.success === false ? 'fail' : 'pass'),
        reasoningLog: result.reasoningLog || []
      });
    } catch (e) {
      appendAuditEntry({ runId, agentId: 'qa_risk', approvalState: 'fail', reasoningLog: [e.message] });
    }
    console.log('QA report:', report.passed, 'passed,', report.failed, 'failed');
    return;
  }

  if (opts.performance) {
    try {
      const perfAgent = require('./agents/performance_intelligence');
      const result = perfAgent.run({}, { suppressFromPerformance: opts.suppressFromPerformance });
      const runId = generateRunId();
      appendAuditEntry({
        runId,
        agentId: 'performance_intelligence',
        approvalState: result.approvalState || 'pass',
        reasoningLog: result.reasoningLog || []
      });
      if (result.outputPayload && result.outputPayload.reportPath) {
        console.log('Performance report:', result.outputPayload.reportPath);
      }
    } catch (e) {
      console.error('Performance step failed:', e.message);
    }
    return;
  }

  const appPath = opts.path && ['indesign', 'photoshop', 'aftereffects'].includes(opts.path) ? opts.path : null;
  if (!appPath) {
    console.log('Usage: node run_cgvip_pipeline.js --path indesign|photoshop|aftereffects [--dataset path] [--approved-only] [--config path]');
    console.log('       node run_cgvip_pipeline.js --post-render [--path app]');
    console.log('       node run_cgvip_pipeline.js --performance [--suppress-from-performance]');
    return;
  }

  const isCSV = appPath === 'indesign';
  const dataPath = opts.dataset || path.join(REPO_ROOT, dataDir, isCSV ? 'variants.csv' : 'variants.json');
  const loaded = loadDataset(dataPath, appPath, opts.approvedOnly);
  if (loaded.error) {
    console.error(loaded.error);
    return;
  }
  let records = loaded.records;
  if (records.length === 0) {
    console.log('No records to process (filtered or empty dataset).');
    return;
  }

  const runId = generateRunId();
  appendAuditEntry({
    runId,
    agentId: 'pipeline',
    approvalState: 'pass',
    reasoningLog: ['CGVIP pipeline started', `app=${appPath} variants=${records.length}`]
  });

  const context = { app: appPath, campaignId: null, runId, config };

  const agentOrder = ['dataset_governance', 'compliance_intelligence', 'template_compatibility'];
  let payload = { records, datasetVersion: null, templateVersion: '1.0' };

  for (const agentId of agentOrder) {
    const agentPath = path.join(__dirname, 'agents', `${agentId}.js`);
    if (!fs.existsSync(agentPath)) continue;
    const result = await runAgent(agentId, { payload, context });
    appendAuditEntry({
      runId,
      agentId,
      approvalState: result.approvalState,
      reasoningLog: result.reasoningLog
    });
    if (result.outputPayload) payload = { ...payload, ...result.outputPayload };
    if (result.approvalState === 'fail' && result.errors.length) {
      console.error(`Agent ${agentId} failed:`, result.errors.join('; '));
      return;
    }
    if (result.outputPayload && result.outputPayload.records) {
      records = result.outputPayload.records;
    }
  }

  const stagingDir = path.join(outputDir, appPath);
  const stagedFile = path.join(stagingDir, isCSV ? 'variants_filtered.csv' : 'variants_filtered.json');
  if (!fs.existsSync(stagingDir)) fs.mkdirSync(stagingDir, { recursive: true });
  if (isCSV) {
    const { recordsToCSV } = require('./src/approval_filter');
    fs.writeFileSync(stagedFile, recordsToCSV(records), 'utf8');
  } else {
    fs.writeFileSync(stagedFile, JSON.stringify(records, null, 2), 'utf8');
  }

  const runOptions = {
    dataPath: stagedFile,
    outputFolder: path.join(REPO_ROOT, outputDir, appPath),
    templatePath: path.join(REPO_ROOT, (config.paths && config.paths.templatesDir) || 'templates', appPath, appPath === 'indesign' ? 'master.indd' : appPath === 'photoshop' ? 'master.psd' : 'master.aep'),
    approvedOnly: opts.approvedOnly
  };
  const jobDir = path.join(outputDir, runId);
  const jobManifest = {
    runId,
    app: appPath,
    status: 'pending',
    variantCount: records.length,
    datasetVersion: payload.datasetVersion || null,
    complianceVersion: payload.complianceVersion || null,
    templateVersion: payload.templateVersion || '1.0'
  };

  const renderPayload = { records, runOptions, jobDir, jobManifest };
  const renderResult = await runAgent('render_orchestration', { payload: renderPayload, context });
  appendAuditEntry({
    runId,
    agentId: 'render_orchestration',
    approvalState: renderResult.approvalState,
    reasoningLog: renderResult.reasoningLog
  });
  if (renderResult.approvalState === 'fail') {
    console.error('Render orchestration failed:', renderResult.errors.join('; '));
    return;
  }

  console.log(getRunInstructions(appPath, runOptions));
  console.log('\nRun ID:', runId);
  console.log('Job manifest:', path.join(jobDir, 'job.json'));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
