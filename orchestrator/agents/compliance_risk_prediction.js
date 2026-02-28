/**
 * CIF Agent 3 — Compliance Risk Prediction Agent (stub).
 * Uses compliance rules + variant/template data to predict legal rejection, regulatory conflict,
 * disclaimer risk. Complements CGVIP Compliance Intelligence (which encodes rules).
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');

/**
 * Stub: assign low risk (0.1) to approved variants, higher (0.5) to unapproved; no claim–market matrix yet.
 * Replace with real rules (VARIANT_SPEC, claim–market matrix, disclaimer expiry) in Phase 2+.
 * @param {Object} payload - { featureStorePath?: string, records?: Array }
 * @param {Object} context - { runId?, complianceVersion? }
 * @returns {Object} Agent result with outputPayload.riskScores: Array<{ variant_id, risk_score, reasons? }>
 */
function run(payload, context = {}) {
  const reasoningLog = [];
  const errors = [];

  let records = [];
  if (payload.records && Array.isArray(payload.records)) {
    records = payload.records;
  } else if (payload.featureStorePath && fs.existsSync(payload.featureStorePath)) {
    try {
      records = JSON.parse(fs.readFileSync(payload.featureStorePath, 'utf8'));
    } catch (e) {
      errors.push(`Failed to read feature store: ${e.message}`);
      return {
        success: false,
        approvalState: 'fail',
        reasoningLog,
        errors,
        outputPayload: null
      };
    }
  } else {
    return {
      success: false,
      approvalState: 'fail',
      reasoningLog: ['Compliance Risk Prediction: no records or featureStorePath in payload'],
      errors: ['payload.records or payload.featureStorePath required'],
      outputPayload: null
    };
  }

  const riskScores = records.map(r => ({
    variant_id: r.variant_id,
    risk_score: r.approved === true ? 0.1 : 0.5,
    reasons: r.approved === true ? [] : ['Unapproved variant; stub risk']
  }));
  reasoningLog.push(`Stub: assigned risk scores for ${riskScores.length} variants`);

  return {
    success: true,
    approvalState: 'pass',
    reasoningLog,
    errors,
    outputPayload: { riskScores }
  };
}

module.exports = { run };
