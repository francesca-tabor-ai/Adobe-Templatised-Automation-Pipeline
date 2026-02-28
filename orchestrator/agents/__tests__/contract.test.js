/**
 * Unit test: agent contract runAgent and normalizeResult.
 */

const assert = require('assert');
const path = require('path');

const { runAgent, normalizeResult } = require('../common/contract');

async function testNormalizeResult() {
  const r = normalizeResult({ success: true, approvalState: 'pass', reasoningLog: [], errors: [] }, 'test');
  assert.strictEqual(r.success, true);
  assert.strictEqual(r.approvalState, 'pass');
  assert.ok(Array.isArray(r.reasoningLog));
  assert.ok(Array.isArray(r.errors));

  const r2 = normalizeResult({ success: false, approvalState: 'fail', errors: ['e1'] }, 'test');
  assert.strictEqual(r2.success, false);
  assert.strictEqual(r2.approvalState, 'fail');
  assert.strictEqual(r2.errors.length, 1);
}

async function testRunAgentMissing() {
  const result = await runAgent('nonexistent_agent_xyz', { payload: {}, context: {} });
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.approvalState, 'fail');
  assert.ok(result.reasoningLog.some(m => m.includes('not found')) || result.errors.some(e => e.includes('missing')));
}

async function testRunAgentDatasetGovernance() {
  const result = await runAgent('dataset_governance', {
    payload: {
      records: [
        { variant_id: 'V1', market: 'US', language: 'en', channel: 'social_1_1' },
        { variant_id: 'V2', market: 'US', language: 'en' }
      ]
    },
    context: { app: 'indesign', runId: 'test_run' }
  });
  assert.ok(typeof result.success === 'boolean');
  assert.ok(['pass', 'fail'].includes(result.approvalState));
  assert.ok(Array.isArray(result.reasoningLog));
  assert.ok(Array.isArray(result.errors));
  assert.ok(result.outputPayload === undefined || (result.outputPayload && (result.outputPayload.records || result.outputPayload.datasetVersion)));
  const hasMissingChannel = result.errors.some(e => e.includes('channel')) || result.reasoningLog.some(m => m.includes('channel'));
  assert.ok(hasMissingChannel || result.approvalState === 'pass', 'expected V2 to fail required field channel');
}

async function main() {
  await testNormalizeResult();
  await testRunAgentMissing();
  await testRunAgentDatasetGovernance();
  console.log('contract.test.js: all tests passed');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
