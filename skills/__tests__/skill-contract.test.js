/**
 * Tests for skills/common/skill-contract.js
 */

const assert = require('assert');
const path = require('path');
const { runSkill, normalizeResult, loadSkillMeta } = require('../common/skill-contract');

async function main() {
  console.log('skill-contract tests...');

  // Test: normalizeResult with valid result
  {
    const result = normalizeResult({
      success: true,
      approvalState: 'pass',
      reasoningLog: ['done'],
      errors: [],
      outputPayload: { key: 'value' },
      artifacts: { '/path': 'desc' }
    }, 'test-skill');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.approvalState, 'pass');
    assert.deepStrictEqual(result.reasoningLog, ['done']);
    assert.deepStrictEqual(result.errors, []);
    assert.deepStrictEqual(result.outputPayload, { key: 'value' });
    assert.deepStrictEqual(result.artifacts, { '/path': 'desc' });
  }

  // Test: normalizeResult with null
  {
    const result = normalizeResult(null, 'test-skill');
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.approvalState, 'fail');
  }

  // Test: normalizeResult with partial result
  {
    const result = normalizeResult({ success: true }, 'test-skill');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.approvalState, 'pass');
    assert.deepStrictEqual(result.reasoningLog, []);
    assert.deepStrictEqual(result.errors, []);
    assert.deepStrictEqual(result.outputPayload, {});
    assert.deepStrictEqual(result.artifacts, {});
  }

  // Test: normalizeResult with failure
  {
    const result = normalizeResult({ success: false, errors: ['boom'] }, 'test-skill');
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.approvalState, 'fail');
  }

  // Test: runSkill with missing skill
  {
    const result = await runSkill('nonexistent-skill-xyz', { payload: {}, context: {} });
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.approvalState, 'fail');
    assert(result.errors[0].includes('missing'));
  }

  // Test: runSkill with real skill (templatisation-comms)
  {
    const result = await runSkill('templatisation-comms', {
      payload: { projectConfig: { contacts: {} } },
      context: { runId: 'test-run', outputDir: path.join(__dirname, '..', '..', 'output', 'test-comms') }
    });
    assert.strictEqual(typeof result.success, 'boolean');
    assert.strictEqual(typeof result.approvalState, 'string');
    assert(Array.isArray(result.reasoningLog));
  }

  // Test: loadSkillMeta
  {
    const meta = loadSkillMeta('templatisation-comms');
    assert(meta);
    assert.strictEqual(meta.id, 'templatisation-comms');
    assert.strictEqual(meta.phase, 0);
    assert(Array.isArray(meta.dependsOn));
    assert(Array.isArray(meta.gates));
  }

  // Test: loadSkillMeta for missing skill
  {
    const meta = loadSkillMeta('nonexistent-skill');
    assert.strictEqual(meta, null);
  }

  console.log('skill-contract tests PASSED');
}

main().catch(err => {
  console.error('skill-contract tests FAILED:', err);
  process.exit(1);
});
