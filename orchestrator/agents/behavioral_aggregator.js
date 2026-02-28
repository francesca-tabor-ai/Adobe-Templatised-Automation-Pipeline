/**
 * CIF Agent 1 — Behavioral Signal Aggregator.
 * Reads variant dataset + manifests (+ optional signals file), normalizes and writes to the creative feature store.
 * Phase 1: collection and versioning only; no prediction or optimization.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');
const FEATURE_STORE_DIR = path.join(REPO_ROOT, 'data/feature_store');

/**
 * Build one feature-store record from a variant and optional manifest entry / signals.
 * @param {Object} variant - Variant record (variant_id, market, language, channel, ...)
 * @param {Object} [manifestEntry] - Optional manifest entry (status, errors, path)
 * @param {Object} [signals] - Optional signals for this variant_id (engagement_metrics, spend_allocation, etc.)
 * @param {string} runId - Run identifier
 * @param {string} [ingestedAt] - ISO timestamp
 * @returns {Object} Creative feature store record
 */
function buildFeatureRecord(variant, manifestEntry, signals, runId, ingestedAt) {
  const ingested = ingestedAt || new Date().toISOString();
  const record = {
    variant_id: variant.variant_id,
    campaign_id: variant.campaign_id || null,
    market: variant.market,
    language: variant.language,
    channel: variant.channel,
    size: variant.size,
    aspect_ratio: variant.aspect_ratio,
    headline: variant.headline,
    subheadline: variant.subheadline,
    cta: variant.cta,
    legal_disclaimer_id: variant.legal_disclaimer_id,
    product_image_id: variant.product_image_id,
    background_image_id: variant.background_image_id,
    compliance_version: variant.compliance_version,
    approved: variant.approved === true,
    hypothesis_id: variant.hypothesis_id,
    variable_changed: variant.variable_changed,
    template_version: variant.template_version || null,
    dataset_version: variant.dataset_version || null,
    app: manifestEntry ? manifestEntry.app : null,
    engagement_metrics: (signals && signals.engagement_metrics) || null,
    spend_allocation: (signals && signals.spend_allocation) != null ? signals.spend_allocation : null,
    approval_cycle_time: (signals && signals.approval_cycle_time) != null ? signals.approval_cycle_time : null,
    revision_frequency: (signals && signals.revision_frequency) != null ? signals.revision_frequency : null,
    compliance_exceptions: manifestEntry && manifestEntry.errors && manifestEntry.errors.length
      ? manifestEntry.errors
      : (signals && signals.compliance_exceptions) || [],
    run_id: runId,
    ingested_at: ingested
  };
  return record;
}

/**
 * Build a map of variant_id -> manifest entry from app manifests.
 * @param {Object} manifestsByApp - { indesign: [...], photoshop: [...], aftereffects: [...] }
 * @returns {Object} Map variant_id -> { app, status, errors }
 */
function indexManifestsByVariantId(manifestsByApp) {
  const byId = {};
  if (!manifestsByApp || typeof manifestsByApp !== 'object') return byId;
  for (const [app, entries] of Object.entries(manifestsByApp)) {
    if (!Array.isArray(entries)) continue;
    entries.forEach(entry => {
      const id = entry.variant_id;
      if (id) {
        byId[id] = {
          app,
          status: entry.status || 'ok',
          errors: entry.errors || (entry.error ? [entry.error] : [])
        };
      }
    });
  }
  return byId;
}

/**
 * Load optional signals file (JSON array or object keyed by variant_id).
 * @param {string} signalsPath - Path to JSON file
 * @returns {Object} Map variant_id -> signals object
 */
function loadSignals(signalsPath) {
  if (!signalsPath || !fs.existsSync(signalsPath)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(signalsPath, 'utf8'));
    if (Array.isArray(data)) {
      const map = {};
      data.forEach(row => {
        if (row.variant_id) map[row.variant_id] = row;
      });
      return map;
    }
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data;
    }
  } catch (e) {
    // ignore
  }
  return {};
}

/**
 * Run the Behavioral Signal Aggregator.
 * @param {Object} payload - { records: Array, manifests?: Object, signalsPath?: string }
 * @param {Object} context - { runId?: string, campaignId?: string }
 * @returns {Object} Agent result { success, approvalState, reasoningLog, errors, outputPayload }
 */
function run(payload, context = {}) {
  const reasoningLog = [];
  const errors = [];
  const runId = context.runId || `run_${Date.now()}`;

  if (!payload || !Array.isArray(payload.records) || payload.records.length === 0) {
    return {
      success: false,
      approvalState: 'fail',
      reasoningLog: ['Behavioral Signal Aggregator: no records in payload'],
      errors: ['payload.records is required and must be a non-empty array'],
      outputPayload: null
    };
  }

  const manifestsByApp = payload.manifests || {};
  const manifestByVariant = indexManifestsByVariantId(manifestsByApp);
  const signalsByVariant = loadSignals(payload.signalsPath || context.signalsPath);

  const records = payload.records.map(variant => {
    const manifestEntry = manifestByVariant[variant.variant_id] || null;
    const signals = signalsByVariant[variant.variant_id] || null;
    return buildFeatureRecord(variant, manifestEntry, signals, runId);
  });

  if (!fs.existsSync(FEATURE_STORE_DIR)) {
    fs.mkdirSync(FEATURE_STORE_DIR, { recursive: true });
  }

  const filename = `run_${runId.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
  const outPath = path.join(FEATURE_STORE_DIR, filename);
  fs.writeFileSync(outPath, JSON.stringify(records, null, 2), 'utf8');
  reasoningLog.push(`Wrote ${records.length} records to ${outPath}`);

  return {
    success: true,
    approvalState: 'pass',
    reasoningLog,
    errors,
    outputPayload: {
      featureStorePath: outPath,
      recordCount: records.length,
      runId
    }
  };
}

module.exports = { run, buildFeatureRecord, indexManifestsByVariantId, loadSignals };
