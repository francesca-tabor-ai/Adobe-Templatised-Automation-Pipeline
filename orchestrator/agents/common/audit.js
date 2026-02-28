/**
 * CGVIP audit log: append-only store. Each entry has timestamp, runId, agentId, version, approvalState, reasoningLog, optional payloadChecksum.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..');
const DEFAULT_AUDIT_DIR = path.join(REPO_ROOT, 'output', 'audit');
const DEFAULT_AUDIT_FILE = 'audit.log'; // JSONL

/**
 * Load audit config from config/defaults.json or config/audit.json.
 * @param {string} [configPath]
 * @returns {{ auditDir: string, auditFile: string, retentionDays?: number }}
 */
function loadAuditConfig(configPath) {
  const defaultsPath = configPath || path.join(REPO_ROOT, 'config', 'defaults.json');
  let auditDir = DEFAULT_AUDIT_DIR;
  let auditFile = DEFAULT_AUDIT_FILE;
  let retentionDays;
  if (fs.existsSync(defaultsPath)) {
    const defaults = JSON.parse(fs.readFileSync(defaultsPath, 'utf8'));
    if (defaults.audit) {
      auditDir = path.isAbsolute(defaults.audit.dir) ? defaults.audit.dir : path.join(REPO_ROOT, defaults.audit.dir);
      auditFile = defaults.audit.file || auditFile;
      retentionDays = defaults.audit.retentionDays;
    }
  }
  const auditPath = path.join(REPO_ROOT, 'config', 'audit.json');
  if (fs.existsSync(auditPath)) {
    const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
    auditDir = audit.dir ? (path.isAbsolute(audit.dir) ? audit.dir : path.join(REPO_ROOT, audit.dir)) : auditDir;
    auditFile = audit.file || auditFile;
    retentionDays = audit.retentionDays != null ? audit.retentionDays : retentionDays;
  }
  return { auditDir, auditFile, retentionDays };
}

/**
 * Append one audit entry (one line of JSON) to the audit log.
 * @param {Object} entry - { runId, agentId, version?, approvalState, reasoningLog, payloadChecksum?, timestamp? }
 * @param {{ auditDir?: string, auditFile?: string }} [options]
 */
function appendAuditEntry(entry, options = {}) {
  const config = loadAuditConfig();
  const dir = options.auditDir || config.auditDir;
  const file = options.auditFile || config.auditFile;
  const fullPath = path.join(dir, file);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const record = {
    timestamp: entry.timestamp || new Date().toISOString(),
    runId: entry.runId,
    agentId: entry.agentId,
    version: entry.version,
    approvalState: entry.approvalState,
    reasoningLog: entry.reasoningLog || [],
    payloadChecksum: entry.payloadChecksum
  };
  fs.appendFileSync(fullPath, JSON.stringify(record) + '\n', 'utf8');
  return record;
}

/**
 * Generate a run ID (timestamp-based for readability).
 * @returns {string}
 */
function generateRunId() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `run_${y}${m}${d}_${h}${min}${s}_${ms}`;
}

module.exports = { loadAuditConfig, appendAuditEntry, generateRunId, DEFAULT_AUDIT_DIR, DEFAULT_AUDIT_FILE };
