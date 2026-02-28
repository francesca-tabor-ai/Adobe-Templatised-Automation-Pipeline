/**
 * CIF Agent 4 — Variant Optimization Agent (stub).
 * Inputs: predicted performance + compliance risk. Outputs: recommended variant mix,
 * suppression list, test set, spend allocation. Phase 3: constraint-based (regulatory boundaries).
 */

/**
 * Stub: pass through all variants with equal recommended_weight; no suppression.
 * Replace with optimization (max expected value subject to compliance constraints) in Phase 3+.
 * @param {Object} payload - { scores?: Array, riskScores?: Array, records?: Array }
 * @param {Object} context - { runId?, campaignId? }
 * @returns {Object} Agent result with outputPayload: { variantIds, suppressionList, spendAllocation?, testSet? }
 */
function run(payload, context = {}) {
  const reasoningLog = [];
  const errors = [];

  const scores = payload.scores || [];
  const riskScores = payload.riskScores || [];
  const records = payload.records || [];

  const scoreByVariant = {};
  scores.forEach(s => { scoreByVariant[s.variant_id] = s; });
  const riskByVariant = {};
  riskScores.forEach(r => { riskByVariant[r.variant_id] = r; });

  let variantIds = records.map(r => r.variant_id);
  if (variantIds.length === 0 && scores.length > 0) {
    variantIds = scores.map(s => s.variant_id);
  }
  if (variantIds.length === 0) {
    return {
      success: false,
      approvalState: 'fail',
      reasoningLog: ['Variant Optimization: no variants to optimize'],
      errors: ['payload.records or payload.scores required'],
      outputPayload: null
    };
  }

  const suppressionList = [];
  const spendAllocation = variantIds.map(id => ({
    variant_id: id,
    recommended_weight: 1 / variantIds.length
  }));
  reasoningLog.push(`Stub: recommended all ${variantIds.length} variants; no suppression`);

  return {
    success: true,
    approvalState: 'pass',
    reasoningLog,
    errors,
    outputPayload: {
      variantIds,
      suppressionList,
      spendAllocation,
      testSet: variantIds
    }
  };
}

module.exports = { run };
