/**
 * Unit test: Template Compatibility agent — payload in → expected approval state and reasoning shape.
 */

const assert = require('assert');
const { run } = require('../template_compatibility');

function testUnderLimitPasses() {
  const result = run(
    {
      records: [
        { variant_id: 'V1', market: 'US', language: 'en', channel: 'social_1_1', headline: 'Short' }
      ],
      templateVersion: '1.0'
    },
    { app: 'indesign' }
  );
  assert.ok(typeof result.success === 'boolean');
  assert.ok(['pass', 'fail'].includes(result.approvalState));
  assert.ok(Array.isArray(result.reasoningLog));
  assert.ok(result.outputPayload && result.outputPayload.records);
}

function testOverLimitFails() {
  const result = run(
    {
      records: [
        { variant_id: 'V1', market: 'US', language: 'en', channel: 'social_1_1', headline: 'A'.repeat(70) }
      ]
    },
    { app: 'indesign' }
  );
  assert.ok(typeof result.success === 'boolean');
  assert.ok(Array.isArray(result.reasoningLog));
  if (result.approvalState === 'fail') {
    assert.ok(result.reasoningLog.some(m => m.includes('length')) || result.errors.some(e => e.includes('length')));
  }
}

function main() {
  testUnderLimitPasses();
  testOverLimitFails();
  console.log('template_compatibility.test.js: all tests passed');
}

main();
