#!/usr/bin/env node
/**
 * CLI: --path indesign|photoshop|aftereffects [--approved-only] [--config path] [--qa-only]
 *       [--phase observability|predict] [--optimized-set path] [--with-attribution]
 * Filters variant data by approval or optimized set; runs CIF agents when --phase or --with-attribution.
 */

const path = require('path');
const fs = require('fs');

const REPO_ROOT = path.resolve(__dirname, '..');
const { filterAndWrite, filterByVariantIds, loadVariantIdsFromFile } = require('./src/approval_filter');
const { getRunInstructions, writeRunConfig } = require('./src/runner');
const { aggregateQA, writeReport } = require('./src/qa_aggregate');
const { runAgent } = require('./agents/common/contract');

function loadConfig(configPath) {
  const p = configPath || path.join(REPO_ROOT, 'config/defaults.json');
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { path: null, approvedOnly: false, config: null, qaOnly: false, phase: null, optimizedSet: null, withAttribution: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--path' && args[i + 1]) {
      out.path = args[++i];
    } else if (args[i] === '--approved-only') {
      out.approvedOnly = true;
    } else if (args[i] === '--config' && args[i + 1]) {
      out.config = args[++i];
    } else if (args[i] === '--qa-only') {
      out.qaOnly = true;
    } else if (args[i] === '--phase' && args[i + 1]) {
      out.phase = args[++i].toLowerCase();
    } else if (args[i] === '--optimized-set' && args[i + 1]) {
      out.optimizedSet = args[++i];
    } else if (args[i] === '--with-attribution') {
      out.withAttribution = true;
    }
  }
  return out;
}

function loadVariantRecords(dataDir) {
  const base = path.isAbsolute(dataDir) ? dataDir : path.join(REPO_ROOT, dataDir);
  const jsonPath = path.join(base, 'variants.json');
  const csvPath = path.join(base, 'variants.csv');
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    return Array.isArray(data) ? data : [data];
  }
  if (fs.existsSync(csvPath)) {
    const { parseCSV } = require('./src/approval_filter');
    const text = fs.readFileSync(csvPath, 'utf8');
    return parseCSV(text);
  }
  return [];
}

function loadAllManifests(outputDir) {
  const apps = ['indesign', 'photoshop', 'aftereffects'];
  const manifests = {};
  const outAbs = path.join(REPO_ROOT, outputDir);
  apps.forEach(app => {
    const manifestPath = path.join(outAbs, app, 'manifest.json');
    if (!fs.existsSync(manifestPath)) return;
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (Array.isArray(manifest)) manifests[app] = manifest;
    } catch (e) {
      // skip
    }
  });
  return manifests;
}

function getLatestFeatureStorePath() {
  const dir = path.join(REPO_ROOT, 'data/feature_store');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir)
    .filter(f => f.startsWith('run_') && f.endsWith('.json'))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(dir, f)).mtime.getTime() }))
    .sort((a, b) => b.mtime - a.mtime);
  return files.length ? path.join(dir, files[0].name) : null;
}

async function runPhaseObservability(opts, config, dataDir, outputDir) {
  const records = loadVariantRecords(dataDir);
  if (records.length === 0) {
    console.log('No variant records found in', dataDir);
    return;
  }
  const manifests = loadAllManifests(outputDir);
  const runId = `obs_${Date.now()}`;
  const result = await runAgent('behavioral_aggregator', {
    payload: { records, manifests },
    context: { runId }
  });
  console.log(result.success ? 'Observability: success' : 'Observability: failed');
  result.reasoningLog.forEach(l => console.log(' ', l));
  if (result.errors && result.errors.length) result.errors.forEach(e => console.error(' ', e));
  if (result.outputPayload && result.outputPayload.featureStorePath) {
    console.log('Feature store:', result.outputPayload.featureStorePath);
  }
}

async function runPhasePredict(opts, config, outputDir) {
  const featureStorePath = opts.featureStorePath || getLatestFeatureStorePath();
  if (!featureStorePath || !fs.existsSync(featureStorePath)) {
    console.log('No feature store found. Run --phase observability first, or pass feature store path.');
    return;
  }
  const records = JSON.parse(fs.readFileSync(featureStorePath, 'utf8'));
  const predResult = await runAgent('performance_prediction', {
    payload: { featureStorePath, records },
    context: { runId: `predict_${Date.now()}` }
  });
  const riskResult = await runAgent('compliance_risk_prediction', {
    payload: { featureStorePath, records },
    context: { runId: `predict_${Date.now()}` }
  });
  const scores = predResult.outputPayload && predResult.outputPayload.scores ? predResult.outputPayload.scores : [];
  const riskScores = riskResult.outputPayload && riskResult.outputPayload.riskScores ? riskResult.outputPayload.riskScores : [];
  const cifDir = path.join(REPO_ROOT, outputDir, 'cif');
  if (!fs.existsSync(cifDir)) fs.mkdirSync(cifDir, { recursive: true });
  const scoresPath = path.join(cifDir, 'cif_scores.json');
  fs.writeFileSync(scoresPath, JSON.stringify({ scores, riskScores }, null, 2), 'utf8');
  console.log('Predict: wrote', scoresPath);
}

async function runWithAttribution(opts, config, outputDir) {
  const featureStorePath = getLatestFeatureStorePath();
  if (!featureStorePath || !fs.existsSync(featureStorePath)) {
    console.log('No feature store found. Run --phase observability first.');
    return;
  }
  const result = await runAgent('economic_attribution', {
    payload: { featureStorePath, runId: `attr_${Date.now()}` },
    context: { runId: `attr_${Date.now()}` }
  });
  console.log(result.success ? 'Attribution: success' : 'Attribution: failed');
  result.reasoningLog.forEach(l => console.log(' ', l));
  if (result.outputPayload && result.outputPayload.attributionPath) {
    console.log('Attribution written:', result.outputPayload.attributionPath);
  }
}

function main() {
  const opts = parseArgs();
  const config = loadConfig(opts.config);
  const dataDir = (config.paths && config.paths.dataDir) || path.join(REPO_ROOT, 'data/sample');
  const outputDir = (config.paths && config.paths.outputDir) || 'output';

  if (opts.qaOnly) {
    const report = aggregateQA();
    writeReport(report);
    console.log('QA report:', report.passed, 'passed,', report.failed, 'failed');
    console.log('Written to', path.join(REPO_ROOT, 'output/qa_report.json'));
    return;
  }

  if (opts.phase === 'observability') {
    runPhaseObservability(opts, config, dataDir, outputDir).catch(e => {
      console.error(e);
      process.exit(1);
    });
    return;
  }

  if (opts.phase === 'predict') {
    runPhasePredict(opts, config, outputDir).catch(e => {
      console.error(e);
      process.exit(1);
    });
    return;
  }

  if (opts.withAttribution && !opts.path) {
    runWithAttribution(opts, config, outputDir).catch(e => {
      console.error(e);
      process.exit(1);
    });
    return;
  }

  const appPath = opts.path && ['indesign', 'photoshop', 'aftereffects'].includes(opts.path.toLowerCase()) ? opts.path.toLowerCase() : null;
  if (!appPath) {
    console.log('Usage: node run_pipeline.js --path indesign|photoshop|aftereffects [--approved-only] [--config path] [--optimized-set path] [--with-attribution]');
    console.log('       node run_pipeline.js --phase observability [--config path]');
    console.log('       node run_pipeline.js --phase predict [--config path]');
    console.log('       node run_pipeline.js --with-attribution');
    console.log('       node run_pipeline.js --qa-only');
    return;
  }

  const isCSV = appPath === 'indesign';
  const dataFile = path.join(REPO_ROOT, dataDir, isCSV ? 'variants.csv' : 'variants.json');
  const stagingDir = path.join(REPO_ROOT, outputDir, appPath);
  let stagedFile = path.join(stagingDir, opts.approvedOnly ? 'variants_filtered.' + (isCSV ? 'csv' : 'json') : (isCSV ? 'variants.csv' : 'variants.json'));
  let dataPath = dataFile;

  if (opts.optimizedSet) {
    const variantIds = loadVariantIdsFromFile(opts.optimizedSet);
    if (variantIds.length === 0) {
      console.log('No variant IDs in optimized set file:', opts.optimizedSet);
      return;
    }
    const optStaged = path.join(stagingDir, 'variants_optimized.' + (isCSV ? 'csv' : 'json'));
    const result = filterByVariantIds(dataFile, optStaged, variantIds);
    console.log('Optimized set: filtered to', result.filteredCount, 'variants (from', result.originalCount, '). Wrote', result.path);
    dataPath = result.filteredCount > 0 ? optStaged : dataFile;
    stagedFile = optStaged;
  } else if (opts.approvedOnly && fs.existsSync(dataFile)) {
    const result = filterAndWrite(dataFile, stagedFile, { approvedOnly: true });
    console.log('Filtered to', result.filteredCount, 'approved records (from', result.originalCount, '). Wrote', result.path);
    dataPath = fs.existsSync(stagedFile) ? stagedFile : dataFile;
  }

  if (!fs.existsSync(dataPath)) {
    console.log('Data file not found:', dataFile);
    return;
  }

  const runOptions = {
    dataPath,
    outputFolder: path.join(REPO_ROOT, outputDir, appPath),
    templatePath: path.join(REPO_ROOT, (config.paths && config.paths.templatesDir) || 'templates', appPath, appPath === 'indesign' ? 'master.indd' : appPath === 'photoshop' ? 'master.psd' : 'master.aep'),
    approvedOnly: opts.approvedOnly
  };
  writeRunConfig(appPath, runOptions);
  console.log(getRunInstructions(appPath, runOptions));

  if (opts.withAttribution) {
    runWithAttribution(opts, config, outputDir).catch(e => console.error('Attribution:', e));
  }
}

main();
