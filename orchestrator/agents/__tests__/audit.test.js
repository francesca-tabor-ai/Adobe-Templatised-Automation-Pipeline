/**
 * Unit test: audit append and runId generation.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { appendAuditEntry, generateRunId, loadAuditConfig } = require('../common/audit');

function testGenerateRunId() {
  const id = generateRunId();
  assert.ok(typeof id === 'string');
  assert.ok(id.startsWith('run_'));
  assert.ok(/\d{8}_\d{6}_\d{3}/.test(id) || id.length >= 10);
}

function testLoadAuditConfig() {
  const config = loadAuditConfig();
  assert.ok(config.auditDir);
  assert.ok(config.auditFile);
}

function testAppendAuditEntry() {
  const entry = {
    runId: 'run_test_audit',
    agentId: 'test_agent',
    approvalState: 'pass',
    reasoningLog: ['test entry']
  };
  const written = appendAuditEntry(entry);
  assert.strictEqual(written.agentId, 'test_agent');
  assert.strictEqual(written.runId, 'run_test_audit');
  assert.ok(written.timestamp);
}

function main() {
  testGenerateRunId();
  testLoadAuditConfig();
  testAppendAuditEntry();
  console.log('audit.test.js: all tests passed');
}

main();
