/**
 * Unit test: Dataset Governance agent — payload in → expected approval state and reasoning shape.
 */

const assert = require('assert');
const { run } = require('../dataset_governance');

function testValidRecordsPass() {
  const result = run(
    {
      records: [
        { variant_id: 'V1', market: 'US', language: 'en', channel: 'social_1_1', headline: 'Test' }
      ]
    },
    { app: 'indesign' }
  );
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.approvalState, 'pass');
  assert.ok(Array.isArray(result.reasoningLog));
  assert.ok(Array.isArray(result.errors));
  assert.ok(result.outputPayload && result.outputPayload.records && result.outputPayload.records.length === 1);
  assert.ok(result.outputPayload.datasetVersion);
}

function testMissingRequiredFieldFails() {
  const result = run(
    {
      records: [
        { variant_id: 'V1', market: 'US', language: 'en' }
      ]
    },
    { app: 'indesign' }
  );
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.approvalState, 'fail');
  assert.ok(result.errors.some(e => e.includes('channel')));
}

function testEmptyRecordsFails() {
  const result = run({ records: [] }, { app: 'indesign' });
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.approvalState, 'fail');
  assert.ok(result.reasoningLog.some(m => m.includes('No records')));
}

function main() {
  testValidRecordsPass();
  testMissingRequiredFieldFails();
  testEmptyRecordsFails();
  console.log('dataset_governance.test.js: all tests passed');
}

main();
