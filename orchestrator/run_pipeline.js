#!/usr/bin/env node
/**
 * CLI: --path indesign|photoshop|aftereffects [--approved-only] [--config path] [--qa-only]
 * Filters variant data by approval if requested, prints run instructions for .jsx, optionally aggregates QA.
 */

const path = require('path');
const fs = require('fs');

const REPO_ROOT = path.resolve(__dirname, '..');
const { filterAndWrite } = require('./src/approval_filter');
const { getRunInstructions, writeRunConfig } = require('./src/runner');
const { aggregateQA, writeReport } = require('./src/qa_aggregate');

function loadConfig(configPath) {
  const p = configPath || path.join(REPO_ROOT, 'config/defaults.json');
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { path: null, approvedOnly: false, config: null, qaOnly: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--path' && args[i + 1]) {
      out.path = args[++i];
    } else if (args[i] === '--approved-only') {
      out.approvedOnly = true;
    } else if (args[i] === '--config' && args[i + 1]) {
      out.config = args[++i];
    } else if (args[i] === '--qa-only') {
      out.qaOnly = true;
    }
  }
  return out;
}

function main() {
  const opts = parseArgs();
  const config = loadConfig(opts.config);
  const dataDir = (config.paths && config.paths.dataDir) || path.join(REPO_ROOT, 'data/sample');
  const outputDir = (config.paths && config.paths.outputDir) || path.join(REPO_ROOT, 'output');

  if (opts.qaOnly) {
    const report = aggregateQA();
    writeReport(report);
    console.log('QA report:', report.passed, 'passed,', report.failed, 'failed');
    console.log('Written to', path.join(REPO_ROOT, 'output/qa_report.json'));
    return;
  }

  const appPath = opts.path && ['indesign', 'photoshop', 'aftereffects'].includes(opts.path.toLowerCase()) ? opts.path.toLowerCase() : null;
  if (!appPath) {
    console.log('Usage: node run_pipeline.js --path indesign|photoshop|aftereffects [--approved-only] [--config path]');
    console.log('       node run_pipeline.js --qa-only');
    return;
  }

  const isCSV = appPath === 'indesign';
  const dataFile = path.join(REPO_ROOT, dataDir, isCSV ? 'variants.csv' : 'variants.json');
  const stagingDir = path.join(outputDir, appPath);
  const stagedFile = path.join(stagingDir, opts.approvedOnly ? 'variants_filtered.' + (isCSV ? 'csv' : 'json') : (isCSV ? 'variants.csv' : 'variants.json'));

  if (opts.approvedOnly && fs.existsSync(dataFile)) {
    const result = filterAndWrite(dataFile, stagedFile, { approvedOnly: true });
    console.log('Filtered to', result.filteredCount, 'approved records (from', result.originalCount, '). Wrote', result.path);
  } else if (!fs.existsSync(dataFile)) {
    console.log('Data file not found:', dataFile);
    return;
  }

  const runOptions = {
    dataPath: opts.approvedOnly && fs.existsSync(stagedFile) ? stagedFile : dataFile,
    outputFolder: path.join(REPO_ROOT, outputDir, appPath),
    templatePath: path.join(REPO_ROOT, (config.paths && config.paths.templatesDir) || 'templates', appPath, appPath === 'indesign' ? 'master.indd' : appPath === 'photoshop' ? 'master.psd' : 'master.aep'),
    approvedOnly: opts.approvedOnly
  };
  writeRunConfig(appPath, runOptions);
  console.log(getRunInstructions(appPath, runOptions));
}

main();
