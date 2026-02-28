/**
 * Dataset Governance Agent: validate dataset integrity, version-lock, detect missing required fields,
 * prevent conflicting claim combinations, enforce naming conventions.
 */

const path = require('path');
const fs = require('fs');

const REPO_ROOT = path.resolve(__dirname, '../../..');
const SCHEMA_PATH = path.join(REPO_ROOT, 'data/schema/variant_schema.json');
const CONFIG_PATH = path.join(REPO_ROOT, 'config/dataset_governance.json');

const REQUIRED_FIELDS = ['variant_id', 'market', 'language', 'channel'];

function loadSchema() {
  if (!fs.existsSync(SCHEMA_PATH)) return { required: REQUIRED_FIELDS, properties: {} };
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  return {
    required: schema.required || REQUIRED_FIELDS,
    properties: schema.properties || {}
  };
}

function loadGovernanceConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return { requiredFieldsPerMarket: {}, conflictingClaims: [], namingRegex: null };
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function validateType(value, propSchema) {
  if (value == null) return true;
  const t = propSchema && propSchema.type;
  if (!t) return true;
  if (t === 'string') return typeof value === 'string';
  if (t === 'boolean') return typeof value === 'boolean';
  if (t === 'number') return typeof value === 'number';
  return true;
}

function validateRecord(record, schema, variantId) {
  const errors = [];
  for (const field of schema.required) {
    const v = record[field];
    if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
      errors.push(`missing required field: ${field}`);
    }
  }
  for (const [key, propSchema] of Object.entries(schema.properties)) {
    if (record[key] !== undefined && record[key] !== null && !validateType(record[key], propSchema)) {
      errors.push(`invalid type for ${key} (expected ${propSchema.type})`);
    }
  }
  return errors;
}

function run(payload, context) {
  const records = payload.records || [];
  const schema = loadSchema();
  const govConfig = loadGovernanceConfig();
  const reasoningLog = [];
  const errors = [];
  let datasetVersion = payload.datasetVersion || null;

  if (records.length === 0) {
    return {
      success: false,
      approvalState: 'fail',
      reasoningLog: ['No records in payload'],
      errors: ['Empty dataset']
    };
  }

  const versionFile = path.join(REPO_ROOT, 'data/sample/dataset_version.txt');
  if (!datasetVersion && fs.existsSync(versionFile)) {
    datasetVersion = fs.readFileSync(versionFile, 'utf8').trim() || new Date().toISOString().slice(0, 10);
  }
  if (!datasetVersion) {
    datasetVersion = new Date().toISOString().slice(0, 10);
  }
  reasoningLog.push(`Dataset version: ${datasetVersion}`);

  const conflictingClaims = govConfig.conflictingClaims || [];
  const namingRegex = govConfig.namingRegex ? new RegExp(govConfig.namingRegex) : null;
  const outRecords = [];

  for (const record of records) {
    const variantId = record.variant_id || '(no id)';
    const recordErrors = validateRecord(record, schema, variantId);

    if (namingRegex && record.variant_id && !namingRegex.test(String(record.variant_id))) {
      recordErrors.push('variant_id does not match naming convention');
    }

    const market = record.market;
    if (govConfig.requiredFieldsPerMarket && govConfig.requiredFieldsPerMarket[market]) {
      const required = govConfig.requiredFieldsPerMarket[market];
      for (const f of required) {
        if (record[f] === undefined || record[f] === null || (typeof record[f] === 'string' && record[f].trim() === '')) {
          recordErrors.push(`missing market-required field: ${f} for market ${market}`);
        }
      }
    }

    for (const rule of conflictingClaims) {
      const { claimA, claimB, market: ruleMarket } = rule;
      if (ruleMarket && record.market !== ruleMarket) continue;
      const a = record[rule.claimFieldA || 'claim_id'] === claimA;
      const b = record[rule.claimFieldB || 'claim_id'] === claimB;
      if (a && b) {
        recordErrors.push(`conflict: ${claimA} and ${claimB} not allowed together${ruleMarket ? ` in market ${ruleMarket}` : ''}`);
      }
    }

    if (recordErrors.length) {
      errors.push(...recordErrors.map(e => `[${variantId}] ${e}`));
      reasoningLog.push(`${variantId}: ${recordErrors.join('; ')}`);
    } else {
      outRecords.push({ ...record, _datasetVersion: datasetVersion });
    }
  }

  const pass = errors.length === 0;
  if (outRecords.length < records.length) {
    reasoningLog.push(`Filtered to ${outRecords.length} valid records (${records.length - outRecords.length} invalid).`);
  }

  return {
    success: pass,
    approvalState: pass ? 'pass' : 'fail',
    reasoningLog,
    errors,
    outputPayload: {
      records: outRecords.length ? outRecords : records,
      datasetVersion
    }
  };
}

module.exports = { run };
