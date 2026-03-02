#!/usr/bin/env node
/**
 * CGVIP pipeline runner: runs agents in order (Dataset Governance → [AI Agents] → Compliance → Template Compatibility → Render),
 * writes audit log, then delegates to existing runner and writes job manifest.
 * Usage: node run_cgvip_pipeline.js --path indesign|photoshop|aftereffects [--dataset path] [--approved-only] [--config path]
 *        node run_cgvip_pipeline.js --post-render [--path app]  (Phase 2: run QA aggregate + QA agent)
 *        node run_cgvip_pipeline.js --performance [--suppress-from-performance] (Phase 3: performance intelligence)
 *
 * AI Generation flags:
 *        --ai-generate-copy              Generate headline/subheadline/CTA variations via LLM
 *        --ai-translate                  Translate text fields across languages
 *        --ai-target-langs de,fr,es      Target languages for translation (comma-separated)
 *        --ai-generate-backgrounds       Generate background images via Imagen/DALL-E
 *        --ai-brief path                 Path to campaign brief JSON file
 *        --ai-provider name              Override default AI provider (google_gemini|anthropic_claude|openai)
 *        --ai-budget-limit N             Override per-run budget limit in USD
 *        --ai-dry-run                    Validate prompts and estimate cost without real API calls
 *        --ai-optimize-prompts           Enhance prompts into cinematic video prompts via multimodal Gemini
 *        --ai-approve path               Approve AI-generated content from approval queue file
 *        --ai-cost-report                Show cost summary of AI usage
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
  const out = {
    path: null, dataset: null, approvedOnly: false, config: null,
    postRender: false, qaOnly: false, performance: false, suppressFromPerformance: false,
    // AI flags
    aiGenerateCopy: false, aiTranslate: false, aiTargetLangs: null,
    aiGenerateBackgrounds: false, aiOptimizePrompts: false, aiBrief: null, aiProvider: null,
    aiBudgetLimit: null, aiDryRun: false, aiApprove: null, aiCostReport: false
  };
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
    } else if (args[i] === '--ai-generate-copy') {
      out.aiGenerateCopy = true;
    } else if (args[i] === '--ai-translate') {
      out.aiTranslate = true;
    } else if (args[i] === '--ai-target-langs' && args[i + 1]) {
      out.aiTargetLangs = args[++i];
    } else if (args[i] === '--ai-generate-backgrounds') {
      out.aiGenerateBackgrounds = true;
    } else if (args[i] === '--ai-optimize-prompts') {
      out.aiOptimizePrompts = true;
    } else if (args[i] === '--ai-brief' && args[i + 1]) {
      out.aiBrief = args[++i];
    } else if (args[i] === '--ai-provider' && args[i + 1]) {
      out.aiProvider = args[++i];
    } else if (args[i] === '--ai-budget-limit' && args[i + 1]) {
      out.aiBudgetLimit = parseFloat(args[++i]);
    } else if (args[i] === '--ai-dry-run') {
      out.aiDryRun = true;
    } else if (args[i] === '--ai-approve' && args[i + 1]) {
      out.aiApprove = args[++i];
    } else if (args[i] === '--ai-cost-report') {
      out.aiCostReport = true;
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

  // --- AI Cost Report ---
  if (opts.aiCostReport) {
    const aiOutputDir = path.join(REPO_ROOT, 'output/ai');
    const costReportPath = path.join(aiOutputDir, 'cost_report.json');
    if (fs.existsSync(costReportPath)) {
      const report = JSON.parse(fs.readFileSync(costReportPath, 'utf8'));
      console.log('AI Cost Report (Run: ' + report.runId + ')');
      console.log('  Total: $' + (report.totalCostUsd || 0).toFixed(4));
      console.log('  Budget: $' + (report.budgetLimitUsd || 0).toFixed(2));
      if (report.byAgent) {
        for (const [agent, data] of Object.entries(report.byAgent)) {
          console.log('  ' + agent + ': ' + data.count + ' calls, $' + data.totalUsd.toFixed(4));
        }
      }
    } else {
      console.log('No AI cost report found. Run AI agents first.');
    }
    return;
  }

  // --- AI Approve ---
  if (opts.aiApprove) {
    const approveFile = path.resolve(opts.aiApprove);
    if (!fs.existsSync(approveFile)) {
      console.error('Approval file not found: ' + approveFile);
      return;
    }
    const approvalData = JSON.parse(fs.readFileSync(approveFile, 'utf8'));
    let approvedCount = 0;
    if (approvalData.items) {
      for (const item of approvalData.items) {
        item.approved = true;
        approvedCount++;
      }
    }
    approvalData.status = 'approved';
    approvalData.reviewedAt = new Date().toISOString();
    fs.writeFileSync(approveFile, JSON.stringify(approvalData, null, 2), 'utf8');
    console.log('Approved ' + approvedCount + ' AI-generated items in ' + approveFile);
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
    console.log('');
    console.log('AI Generation:');
    console.log('       --ai-generate-copy              Generate headline/subheadline/CTA variations');
    console.log('       --ai-translate --ai-target-langs de,fr   Translate to target languages');
    console.log('       --ai-generate-backgrounds       Generate background images');
    console.log('       --ai-optimize-prompts           Enhance into cinematic video prompts (multimodal)');
    console.log('       --ai-brief path                 Campaign brief JSON');
    console.log('       --ai-provider name              Override provider (google_gemini|anthropic_claude|openai)');
    console.log('       --ai-budget-limit N             Budget limit in USD');
    console.log('       --ai-dry-run                    Estimate cost without calling APIs');
    console.log('       --ai-approve path               Approve AI content from queue file');
    console.log('       --ai-cost-report                Show AI cost summary');
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

  // Build AI context if any AI flags are active
  const hasAI = opts.aiGenerateCopy || opts.aiTranslate || opts.aiGenerateBackgrounds || opts.aiOptimizePrompts;
  let brief = {};
  if (opts.aiBrief) {
    const briefPath = path.resolve(opts.aiBrief);
    if (fs.existsSync(briefPath)) brief = JSON.parse(fs.readFileSync(briefPath, 'utf8'));
  }

  const context = {
    app: appPath, campaignId: null, runId, config,
    // AI context passed to agents
    aiProvider: opts.aiProvider || null,
    aiBudgetLimit: opts.aiBudgetLimit || null,
    aiTargetLangs: opts.aiTargetLangs || null,
    aiDryRun: opts.aiDryRun || false
  };

  // Build agent order dynamically: dataset_governance → [AI agents] → compliance → template
  const agentOrder = ['dataset_governance'];
  if (opts.aiGenerateCopy) agentOrder.push('ai_copy_generation');
  if (opts.aiTranslate) agentOrder.push('ai_translation');
  if (opts.aiGenerateBackgrounds) agentOrder.push('ai_background_generation');
  if (opts.aiOptimizePrompts) agentOrder.push('ai_prompt_optimizer');
  agentOrder.push('compliance_intelligence', 'template_compatibility');

  let payload = { records, datasetVersion: null, templateVersion: '1.0', brief, targetLanguages: opts.aiTargetLangs };

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

  // --- AI content summary ---
  if (hasAI) {
    const aiGenerated = records.filter(r => r.ai_generated || r.ai_translated);
    const approvalFiles = [];
    if (payload.approvalFile) approvalFiles.push(payload.approvalFile);
    const totalAiCost = payload.aiTotalCostUsd || 0;

    console.log('\n--- AI Content Generation Summary ---');
    console.log('  Original variants: ' + (records.length - aiGenerated.length));
    console.log('  AI-generated variants: ' + aiGenerated.length);
    console.log('  Total AI cost: $' + totalAiCost.toFixed(4));
    if (approvalFiles.length) {
      console.log('  Approval queue files:');
      approvalFiles.forEach(f => console.log('    ' + f));
    }
    console.log('  Status: AI content pending human review (approved=false)');
    console.log('  To approve: node run_cgvip_pipeline.js --ai-approve <approval_file>');
    console.log('-----------------------------------\n');
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
