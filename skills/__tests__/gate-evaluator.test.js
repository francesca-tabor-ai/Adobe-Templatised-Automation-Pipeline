/**
 * Tests for skills/common/gate-evaluator.js
 */

const assert = require('assert');
const { evaluateGates, evaluateGate, resolveField } = require('../common/gate-evaluator');

async function main() {
  console.log('gate-evaluator tests...');

  // Test: resolveField
  {
    const obj = { campaign: { hasIridescentEffects: true, markets: ['US'] }, project: { skuCount: 3 } };
    assert.strictEqual(resolveField(obj, 'campaign.hasIridescentEffects'), true);
    assert.strictEqual(resolveField(obj, 'project.skuCount'), 3);
    assert.strictEqual(resolveField(obj, 'nonexistent.path'), undefined);
    assert.strictEqual(resolveField(obj, 'campaign.nonexistent'), undefined);
    assert.deepStrictEqual(resolveField(obj, 'campaign.markets'), ['US']);
  }

  // Test: resolveField with null/undefined
  {
    assert.strictEqual(resolveField(null, 'a.b'), undefined);
    assert.strictEqual(resolveField(undefined, 'a'), undefined);
  }

  // Test: evaluateGate - equals
  {
    assert.strictEqual(evaluateGate({ field: 'a', operator: 'equals', value: true }, { a: true }), true);
    assert.strictEqual(evaluateGate({ field: 'a', operator: 'equals', value: true }, { a: false }), false);
    assert.strictEqual(evaluateGate({ field: 'a', operator: 'equals', value: 'hello' }, { a: 'hello' }), true);
  }

  // Test: evaluateGate - notEquals
  {
    assert.strictEqual(evaluateGate({ field: 'a', operator: 'notEquals', value: true }, { a: false }), true);
    assert.strictEqual(evaluateGate({ field: 'a', operator: 'notEquals', value: true }, { a: true }), false);
  }

  // Test: evaluateGate - greaterThan
  {
    assert.strictEqual(evaluateGate({ field: 'count', operator: 'greaterThan', value: 1 }, { count: 3 }), true);
    assert.strictEqual(evaluateGate({ field: 'count', operator: 'greaterThan', value: 1 }, { count: 1 }), false);
    assert.strictEqual(evaluateGate({ field: 'count', operator: 'greaterThan', value: 1 }, { count: 0 }), false);
    // Non-number should return false
    assert.strictEqual(evaluateGate({ field: 'count', operator: 'greaterThan', value: 1 }, { count: 'abc' }), false);
  }

  // Test: evaluateGate - lessThan
  {
    assert.strictEqual(evaluateGate({ field: 'count', operator: 'lessThan', value: 5 }, { count: 3 }), true);
    assert.strictEqual(evaluateGate({ field: 'count', operator: 'lessThan', value: 5 }, { count: 5 }), false);
  }

  // Test: evaluateGate - exists
  {
    assert.strictEqual(evaluateGate({ field: 'a', operator: 'exists' }, { a: 'yes' }), true);
    assert.strictEqual(evaluateGate({ field: 'a', operator: 'exists' }, { a: 0 }), true);
    assert.strictEqual(evaluateGate({ field: 'a', operator: 'exists' }, { a: null }), false);
    assert.strictEqual(evaluateGate({ field: 'a', operator: 'exists' }, {}), false);
  }

  // Test: evaluateGate - unknown operator
  {
    assert.strictEqual(evaluateGate({ field: 'a', operator: 'unknown', value: 1 }, { a: 1 }), false);
  }

  // Test: evaluateGates - empty gates (always pass)
  {
    const result = evaluateGates([], {});
    assert.strictEqual(result.pass, true);
    assert.deepStrictEqual(result.results, []);
  }

  // Test: evaluateGates - null gates
  {
    const result = evaluateGates(null, {});
    assert.strictEqual(result.pass, true);
  }

  // Test: evaluateGates - all pass
  {
    const gates = [
      { field: 'campaign.hasIridescentEffects', operator: 'equals', value: true }
    ];
    const config = { campaign: { hasIridescentEffects: true } };
    const result = evaluateGates(gates, config);
    assert.strictEqual(result.pass, true);
    assert.strictEqual(result.results[0].pass, true);
    assert.strictEqual(result.results[0].actual, true);
  }

  // Test: evaluateGates - one fails
  {
    const gates = [
      { field: 'campaign.hasIridescentEffects', operator: 'equals', value: true },
      { field: 'project.skuCount', operator: 'greaterThan', value: 1 }
    ];
    const config = { campaign: { hasIridescentEffects: true }, project: { skuCount: 1 } };
    const result = evaluateGates(gates, config);
    assert.strictEqual(result.pass, false);
    assert.strictEqual(result.results[0].pass, true);
    assert.strictEqual(result.results[1].pass, false);
  }

  // Test: evaluateGates - iridescent gate with real project config
  {
    const gates = [{ field: 'campaign.hasIridescentEffects', operator: 'equals', value: true }];
    const configTrue = { campaign: { hasIridescentEffects: true } };
    const configFalse = { campaign: { hasIridescentEffects: false } };
    const configMissing = { campaign: {} };

    assert.strictEqual(evaluateGates(gates, configTrue).pass, true);
    assert.strictEqual(evaluateGates(gates, configFalse).pass, false);
    assert.strictEqual(evaluateGates(gates, configMissing).pass, false);
  }

  // Test: evaluateGates - multisku gate
  {
    const gates = [{ field: 'project.skuCount', operator: 'greaterThan', value: 1 }];
    assert.strictEqual(evaluateGates(gates, { project: { skuCount: 3 } }).pass, true);
    assert.strictEqual(evaluateGates(gates, { project: { skuCount: 1 } }).pass, false);
    assert.strictEqual(evaluateGates(gates, { project: {} }).pass, false);
  }

  console.log('gate-evaluator tests PASSED');
}

main().catch(err => {
  console.error('gate-evaluator tests FAILED:', err);
  process.exit(1);
});
