#!/usr/bin/env node
/**
 * Generate DAM sidecar metadata from manifest(s) and variant data.
 * Reads output/{app}/manifest.json and data/sample/variants (CSV/JSON), writes
 * output/{app}/{variant_id}.metadata.json per asset.
 * CGVIP: supports --run-id, --campaign-id, --approval-timestamp for audit traceability.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'output');
const DATA_DIR = path.join(REPO_ROOT, 'data/sample');
const APPS = ['indesign', 'photoshop', 'aftereffects'];

function parseArgs() {
  const args = process.argv.slice(2);
  let runId = null;
  let campaignId = null;
  let approvalTimestamp = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--run-id' && args[i + 1]) runId = args[++i];
    else if (args[i] === '--campaign-id' && args[i + 1]) campaignId = args[++i];
    else if (args[i] === '--approval-timestamp' && args[i + 1]) approvalTimestamp = args[++i];
  }
  return { runId, campaignId, approvalTimestamp };
}

function loadJSON(p) {
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return null;
  }
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((h, j) => { obj[h] = vals[j] !== undefined ? vals[j] : ''; });
    rows.push(obj);
  }
  return rows;
}

function getVariantRecord(variantId) {
  const jsonPath = path.join(DATA_DIR, 'variants.json');
  const csvPath = path.join(DATA_DIR, 'variants.csv');
  if (fs.existsSync(jsonPath)) {
    const data = loadJSON(jsonPath);
    const arr = Array.isArray(data) ? data : [data];
    return arr.find(r => String(r.variant_id) === String(variantId)) || {};
  }
  if (fs.existsSync(csvPath)) {
    const text = fs.readFileSync(csvPath, 'utf8');
    const rows = parseCSV(text);
    return rows.find(r => String(r.variant_id) === String(variantId)) || {};
  }
  return {};
}

function main() {
  const { runId, campaignId, approvalTimestamp } = parseArgs();
  let templateVersion = '1.0';
  let datasetVersion = new Date().toISOString().slice(0, 10);
  const createdBy = 'automation';
  const createdAt = new Date().toISOString();
  const approvalTs = approvalTimestamp || createdAt;
  let automationAgentSignature = 'cgvip-v1';

  if (runId) {
    const jobPath = path.join(OUTPUT_DIR, runId, 'job.json');
    const job = loadJSON(jobPath);
    if (job) {
      templateVersion = job.templateVersion || templateVersion;
      datasetVersion = job.datasetVersion || datasetVersion;
    }
    automationAgentSignature = `runId=${runId}`;
  }

  APPS.forEach(app => {
    const manifestPath = path.join(OUTPUT_DIR, app, 'manifest.json');
    const manifest = loadJSON(manifestPath);
    if (!manifest || !Array.isArray(manifest)) return;
    manifest.forEach(entry => {
      const vid = entry.variant_id;
      if (!vid || vid === 'run') return;
      const rec = getVariantRecord(vid);
      const meta = {
        variant_id: vid,
        market: rec.market || '',
        language: rec.language || '',
        channel: rec.channel || '',
        size: rec.size || '',
        template_version: templateVersion,
        dataset_version: datasetVersion,
        compliance_version: rec.compliance_version || '',
        created_by: createdBy,
        created_at: createdAt,
        campaign_id: campaignId || '',
        approval_timestamp: approvalTs,
        automation_agent_signature: automationAgentSignature
      };
      const outPath = path.join(OUTPUT_DIR, app, vid + '.metadata.json');
      fs.writeFileSync(outPath, JSON.stringify(meta, null, 2), 'utf8');
    });
  });
  console.log('DAM metadata sidecars written under output/{app}/');
}

main();
