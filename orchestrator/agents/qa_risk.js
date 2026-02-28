/**
 * QA & Risk Agent: post-render validation — disclaimer presence, safe area, missing assets,
 * brand layer integrity, version alignment. Gates before DAM publish.
 */

const path = require('path');
const fs = require('fs');
const { loadManifest } = require('../src/qa_aggregate');

const REPO_ROOT = path.resolve(__dirname, '../../..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'output');
const APPS = ['indesign', 'photoshop', 'aftereffects'];
const QA_RISK_CONFIG = path.join(REPO_ROOT, 'config/qa_risk.json');

function loadQaRiskConfig() {
  if (!fs.existsSync(QA_RISK_CONFIG)) return { requireDisclaimerInManifest: true, requirePreflightOk: true, blockOnAnyFailure: true };
  try {
    return JSON.parse(fs.readFileSync(QA_RISK_CONFIG, 'utf8'));
  } catch (e) {
    return { requireDisclaimerInManifest: true, requirePreflightOk: true, blockOnAnyFailure: true };
  }
}

function run(payload, context) {
  const report = payload.report;
  const failures = payload.failures || (report && report.failures) || [];
  const config = loadQaRiskConfig();

  const reasoningLog = [];
  const errors = [];

  if (!report) {
    const apps = context.app ? [context.app] : APPS;
    let passed = 0;
    const collectedFailures = [];
    apps.forEach(app => {
      const manifest = loadManifest(app);
      if (!manifest || !Array.isArray(manifest)) return;
      manifest.forEach(entry => {
        const status = entry.status || 'ok';
        if (status === 'ok' || status === 'warning') passed++;
        else collectedFailures.push({ app, variant_id: entry.variant_id, status, errors: entry.errors || [entry.error] || [] });
      });
    });
    return run({ report: { passed, failed: collectedFailures.length, failures: collectedFailures }, failures: collectedFailures }, context);
  }

  reasoningLog.push(`QA report: ${report.passed} passed, ${report.failed} failed.`);

  if (config.blockOnAnyFailure && report.failed > 0) {
    errors.push(`${report.failed} variant(s) failed QA`);
    failures.forEach(f => {
      reasoningLog.push(`[${f.app}] ${f.variant_id}: ${(f.errors || []).join('; ')}`);
    });
  }

  if (config.requirePreflightOk || config.requireDisclaimerInManifest) {
    APPS.forEach(app => {
      const manifest = loadManifest(app);
      if (!manifest || !Array.isArray(manifest)) return;
      manifest.forEach(entry => {
        if (config.requirePreflightOk && entry.preflight_ok === false) {
          errors.push(`[${app}] ${entry.variant_id}: preflight failed`);
          reasoningLog.push(`Preflight failed: ${app} ${entry.variant_id}`);
        }
        if (config.requireDisclaimerInManifest && entry.disclaimer_present === false) {
          errors.push(`[${app}] ${entry.variant_id}: disclaimer missing`);
          reasoningLog.push(`Disclaimer missing: ${app} ${entry.variant_id}`);
        }
      });
    });
  }

  const pass = errors.length === 0;
  return {
    success: pass,
    approvalState: pass ? 'pass' : 'fail',
    reasoningLog,
    errors,
    outputPayload: pass ? { qaApproved: true } : { qaApproved: false, failures }
  };
}

module.exports = { run };
