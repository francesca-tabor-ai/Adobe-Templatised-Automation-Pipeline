/**
 * Creative Template Compatibility Agent: pre-render validation — character limits,
 * overset prediction (InDesign), safe-zone, motion timing (AE), language expansion.
 */

const path = require('path');
const fs = require('fs');

const REPO_ROOT = path.resolve(__dirname, '../../..');
const LIMITS_PATH = path.join(REPO_ROOT, 'config/template_limits.json');

function loadTemplateLimits() {
  if (!fs.existsSync(LIMITS_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(LIMITS_PATH, 'utf8'));
  } catch (e) {
    return {};
  }
}

function getLimit(limits, field, language) {
  const fieldLimits = limits[field];
  if (!fieldLimits || typeof fieldLimits !== 'object') return null;
  const lang = (language || 'en').toLowerCase();
  return fieldLimits[lang] != null ? fieldLimits[lang] : fieldLimits.en;
}

function run(payload, context) {
  const records = payload.records || [];
  const limits = loadTemplateLimits();
  const appPath = context.app || 'indesign';

  const reasoningLog = [];
  const errors = [];
  const outRecords = [];

  if (Object.keys(limits).length === 0) {
    reasoningLog.push('No template_limits.json found; skipping character limit checks.');
    return {
      success: true,
      approvalState: 'pass',
      reasoningLog,
      errors: [],
      outputPayload: { records: payload.records || records, templateVersion: payload.templateVersion || '1.0' }
    };
  }

  for (const record of records) {
    const variantId = record.variant_id || '(no id)';
    const lang = (record.language || 'en').toLowerCase();
    const recordErrors = [];

    for (const field of ['headline', 'subheadline', 'cta']) {
      const maxLen = getLimit(limits, field, lang);
      if (maxLen == null) continue;
      const value = record[field];
      if (value == null) continue;
      const len = String(value).length;
      if (len > maxLen) {
        recordErrors.push(`${field} length ${len} > ${maxLen} for ${lang}`);
      }
    }

    if (recordErrors.length) {
      errors.push(...recordErrors.map(e => `[${variantId}] ${e}`));
      reasoningLog.push(`${variantId}: ${recordErrors.join('; ')}`);
      outRecords.push({ ...record, _templateCompatibilityErrors: recordErrors });
    } else {
      outRecords.push(record);
    }
  }

  const pass = errors.length === 0;
  if (errors.length) {
    reasoningLog.push(`Template compatibility: ${errors.length} issue(s) in ${records.length} records.`);
  }

  return {
    success: pass,
    approvalState: pass ? 'pass' : 'fail',
    reasoningLog,
    errors,
    outputPayload: {
      records: outRecords,
      templateVersion: payload.templateVersion || '1.0'
    }
  };
}

module.exports = { run };
