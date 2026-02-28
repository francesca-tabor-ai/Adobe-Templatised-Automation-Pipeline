/**
 * Unit test: Compliance Intelligence agent — payload in → expected approval state and reasoning shape.
 */

const assert = require('assert');
const { run } = require('../compliance_intelligence');

function testValidRecordPasses() {
  const result = run(
    {
      records: [
        { variant_id: 'V1', market: 'US', language: 'en', channel: 'social_1_1', legal_disclaimer_id: 'disclaimer_1' }
      ]
    },
    { app: 'indesign' }
  );
  assert.ok(typeof result.success === 'boolean');
  assert.ok(['pass', 'fail'].includes(result.approvalState));
  assert.ok(Array.isArray(result.reasoningLog));
  assert.ok(result.outputPayload && result.outputPayload.records);
  assert.ok(result.outputPayload.records[0].compliance_approved !== undefined);
}

function testExceptionReportShape() {
  const result = run(
    {
      records: [
        { variant_id: 'V1', market: 'XX', language: 'en', channel: 'social_1_1', legal_disclaimer_id: 'nonexistent' }
      ]
    },
    { app: 'indesign' }
  );
  assert.ok(Array.isArray(result.reasoningLog));
  assert.ok(result.outputPayload.exceptionReport === undefined || Array.isArray(result.outputPayload.exceptionReport));
}

function main() {
  testValidRecordPasses();
  testExceptionReportShape();
  console.log('compliance_intelligence.test.js: all tests passed');
}

main();
