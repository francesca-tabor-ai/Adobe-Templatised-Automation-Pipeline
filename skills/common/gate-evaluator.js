/**
 * Gate evaluator: decides whether a conditional skill should run.
 * Gates are defined in skill meta.gates as:
 *   [{ field: "campaign.hasIridescentEffects", operator: "equals", value: true }]
 *
 * Supported operators: equals, notEquals, greaterThan, lessThan, exists
 */

/**
 * Resolve a dot-path field from an object.
 * @param {Object} obj
 * @param {string} fieldPath - e.g. "campaign.hasIridescentEffects"
 * @returns {*}
 */
function resolveField(obj, fieldPath) {
  const parts = fieldPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Evaluate a single gate condition.
 * @param {{ field: string, operator: string, value: * }} gate
 * @param {Object} projectConfig
 * @returns {boolean}
 */
function evaluateGate(gate, projectConfig) {
  const value = resolveField(projectConfig, gate.field);
  switch (gate.operator) {
    case 'equals': return value === gate.value;
    case 'notEquals': return value !== gate.value;
    case 'greaterThan': return typeof value === 'number' && value > gate.value;
    case 'lessThan': return typeof value === 'number' && value < gate.value;
    case 'exists': return value !== undefined && value !== null;
    default: return false;
  }
}

/**
 * Evaluate all gates for a skill. All must pass for the skill to run.
 * @param {Array} gates - skill meta.gates array
 * @param {Object} projectConfig
 * @returns {{ pass: boolean, results: Array<{ field: string, operator: string, expected: *, actual: *, pass: boolean }> }}
 */
function evaluateGates(gates, projectConfig) {
  if (!gates || gates.length === 0) return { pass: true, results: [] };
  const results = gates.map(g => ({
    field: g.field,
    operator: g.operator,
    expected: g.value,
    actual: resolveField(projectConfig, g.field),
    pass: evaluateGate(g, projectConfig)
  }));
  return {
    pass: results.every(r => r.pass),
    results
  };
}

module.exports = { evaluateGates, evaluateGate, resolveField };
