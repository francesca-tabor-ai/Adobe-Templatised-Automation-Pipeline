/**
 * CGVIP agent contract: input/output shape and runAgent helper.
 * Every agent receives { payload, context } and returns { success, approvalState, reasoningLog, errors, outputPayload }.
 */

const path = require('path');
const fs = require('fs');

const AGENTS_DIR = path.resolve(__dirname, '..');

/**
 * Standard agent input shape.
 * @typedef {Object} AgentInput
 * @property {Object} payload - e.g. { records, datasetVersion, templateVersion }
 * @property {Object} context - e.g. { app, campaignId, runId }
 */

/**
 * Standard agent output shape.
 * @typedef {Object} AgentResult
 * @property {boolean} success
 * @property {string} approvalState - 'pass' | 'fail' | 'warning'
 * @property {string[]} reasoningLog
 * @property {string[]} errors
 * @property {Object} [outputPayload] - passed to next agent or pipeline
 */

/**
 * Run an agent by id; returns standard result. Agents are Node modules in orchestrator/agents/ with a run(payload, context) export.
 * @param {string} agentId - e.g. 'dataset_governance', 'compliance_intelligence'
 * @param {AgentInput} input - { payload, context }
 * @returns {Promise<AgentResult>}
 */
async function runAgent(agentId, input) {
  const modulePath = path.join(AGENTS_DIR, `${agentId}.js`);
  if (!fs.existsSync(modulePath)) {
    return {
      success: false,
      approvalState: 'fail',
      reasoningLog: [`Agent not found: ${agentId}`],
      errors: [`Agent module missing: ${modulePath}`]
    };
  }
  const agent = require(modulePath);
  if (typeof agent.run !== 'function') {
    return {
      success: false,
      approvalState: 'fail',
      reasoningLog: [`Agent ${agentId} has no run function`],
      errors: [`Invalid agent: ${agentId}`]
    };
  }
  let result = agent.run(input.payload, input.context);
  if (result && typeof result.then === 'function') {
    result = await result;
  }
  return normalizeResult(result, agentId);
}

/**
 * Ensure result has required fields.
 * @param {Object} result
 * @param {string} agentId
 * @returns {AgentResult}
 */
function normalizeResult(result, agentId) {
  if (!result || typeof result !== 'object') {
    return {
      success: false,
      approvalState: 'fail',
      reasoningLog: [`Agent ${agentId} returned invalid result`],
      errors: ['Invalid agent result']
    };
  }
  return {
    success: result.success !== false && result.approvalState !== 'fail',
    approvalState: result.approvalState || (result.success === false ? 'fail' : 'pass'),
    reasoningLog: Array.isArray(result.reasoningLog) ? result.reasoningLog : [],
    errors: Array.isArray(result.errors) ? result.errors : [],
    outputPayload: result.outputPayload
  };
}

module.exports = { runAgent, normalizeResult };
