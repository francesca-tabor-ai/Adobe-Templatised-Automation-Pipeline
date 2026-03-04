/**
 * Skill contract: input/output shape and runSkill helper.
 * Mirrors orchestrator/agents/common/contract.js for the skills system.
 * Every skill receives { payload, context } and returns
 * { success, approvalState, reasoningLog, errors, outputPayload, artifacts }.
 */

const path = require('path');
const fs = require('fs');

const SKILLS_DIR = path.resolve(__dirname, '..');

/**
 * Standard skill result shape.
 * @typedef {Object} SkillResult
 * @property {boolean} success
 * @property {string} approvalState - 'pass' | 'fail' | 'warning' | 'skipped'
 * @property {string[]} reasoningLog
 * @property {string[]} errors
 * @property {Object} [outputPayload] - data passed to next skill
 * @property {Object} [artifacts] - files created { path: description }
 */

/**
 * Run a skill by id; returns standard result.
 * Skills are Node modules in skills/{skillId}/index.js with a run(payload, context) export.
 * @param {string} skillId - e.g. 'templatisation-workspace'
 * @param {{ payload: Object, context: Object }} input
 * @returns {Promise<SkillResult>}
 */
async function runSkill(skillId, input) {
  const modulePath = path.join(SKILLS_DIR, skillId, 'index.js');
  if (!fs.existsSync(modulePath)) {
    return {
      success: false,
      approvalState: 'fail',
      reasoningLog: [`Skill not found: ${skillId}`],
      errors: [`Skill module missing: ${modulePath}`],
      outputPayload: {},
      artifacts: {}
    };
  }
  const skill = require(modulePath);
  if (typeof skill.run !== 'function') {
    return {
      success: false,
      approvalState: 'fail',
      reasoningLog: [`Skill ${skillId} has no run function`],
      errors: [`Invalid skill: ${skillId}`],
      outputPayload: {},
      artifacts: {}
    };
  }
  let result;
  try {
    result = skill.run(input.payload, input.context);
    if (result && typeof result.then === 'function') {
      result = await result;
    }
  } catch (err) {
    return {
      success: false,
      approvalState: 'fail',
      reasoningLog: [`Skill ${skillId} threw: ${err.message}`],
      errors: [err.message],
      outputPayload: {},
      artifacts: {}
    };
  }
  return normalizeResult(result, skillId);
}

/**
 * Ensure result has all required fields.
 * @param {Object} result
 * @param {string} skillId
 * @returns {SkillResult}
 */
function normalizeResult(result, skillId) {
  if (!result || typeof result !== 'object') {
    return {
      success: false,
      approvalState: 'fail',
      reasoningLog: [`Skill ${skillId} returned invalid result`],
      errors: ['Invalid skill result'],
      outputPayload: {},
      artifacts: {}
    };
  }
  return {
    success: result.success !== false && result.approvalState !== 'fail',
    approvalState: result.approvalState || (result.success === false ? 'fail' : 'pass'),
    reasoningLog: Array.isArray(result.reasoningLog) ? result.reasoningLog : [],
    errors: Array.isArray(result.errors) ? result.errors : [],
    outputPayload: result.outputPayload || {},
    artifacts: result.artifacts || {}
  };
}

/**
 * Load skill metadata without executing.
 * @param {string} skillId
 * @returns {{ id: string, name: string, phase: number, dependsOn: string[], gates: Object[] } | null}
 */
function loadSkillMeta(skillId) {
  const modulePath = path.join(SKILLS_DIR, skillId, 'index.js');
  if (!fs.existsSync(modulePath)) return null;
  const skill = require(modulePath);
  return skill.meta || null;
}

module.exports = { runSkill, normalizeResult, loadSkillMeta, SKILLS_DIR };
