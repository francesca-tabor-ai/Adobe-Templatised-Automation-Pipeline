/**
 * Read manifests from output/{app}/manifest.json, produce a single QA report.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'output');
const APPS = ['indesign', 'photoshop', 'aftereffects'];

/**
 * Load manifest from output/app/manifest.json if it exists.
 */
function loadManifest(app) {
  const manifestPath = path.join(OUTPUT_DIR, app, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    return null;
  }
}

/**
 * Aggregate all app manifests into one QA report.
 * @param {{ apps?: string[] }} options - which apps to include (default all)
 * @returns {{ passed: number, failed: number, failures: Array<{ app, variant_id, status, errors }> } }
 */
function aggregateQA(options = {}) {
  const apps = options.apps || APPS;
  const failures = [];
  let passed = 0;

  apps.forEach(app => {
    const manifest = loadManifest(app);
    if (!manifest || !Array.isArray(manifest)) return;
    manifest.forEach(entry => {
      const status = entry.status || 'ok';
      if (status === 'ok' || status === 'warning') {
        passed++;
      } else {
        failures.push({
          app,
          variant_id: entry.variant_id,
          status,
          errors: entry.errors || [entry.error] || []
        });
      }
    });
  });

  const report = {
    passed,
    failed: failures.length,
    failures
  };
  return report;
}

/**
 * Write QA report to output/qa_report.json and output/qa_failures.txt
 */
function writeReport(report, options = {}) {
  const outDir = options.outputDir || OUTPUT_DIR;
  const jsonPath = path.join(outDir, 'qa_report.json');
  const txtPath = path.join(outDir, 'qa_failures.txt');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
  const lines = [
    `QA Report: ${report.passed} passed, ${report.failed} failed`,
    '',
    ...report.failures.map(f => `[${f.app}] ${f.variant_id}: ${(f.errors || []).join('; ')}`)
  ];
  fs.writeFileSync(txtPath, lines.join('\n'), 'utf8');
  return { jsonPath, txtPath };
}

module.exports = { aggregateQA, writeReport, loadManifest };
