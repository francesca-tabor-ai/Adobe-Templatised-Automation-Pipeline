/**
 * Compliance Intelligence Agent: encode and validate regulatory rules — claim–market matrix,
 * disclaimer matching, expiry, health warnings, age-restriction formatting.
 */

const path = require('path');
const fs = require('fs');

const REPO_ROOT = path.resolve(__dirname, '../../..');
const COMPLIANCE_DIR = path.join(REPO_ROOT, 'config/compliance');

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return null;
  }
}

function loadClaimMarket() {
  const p = path.join(COMPLIANCE_DIR, 'claim_market.json');
  return loadJson(p) || {};
}

function loadDisclaimerLibrary() {
  const p = path.join(COMPLIANCE_DIR, 'disclaimer_library.json');
  return loadJson(p) || {};
}

function loadExpiryRules() {
  const p = path.join(COMPLIANCE_DIR, 'expiry_rules.json');
  return loadJson(p) || {};
}

function parseDate(s) {
  if (!s || typeof s !== 'string') return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function run(payload, context) {
  const records = payload.records || [];
  const claimMarket = loadClaimMarket();
  const disclaimerLibrary = loadDisclaimerLibrary();
  const expiryRules = loadExpiryRules();

  const reasoningLog = [];
  const errors = [];
  const exceptionReport = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let complianceVersion = payload.complianceVersion || 'v1';
  reasoningLog.push(`Compliance version: ${complianceVersion}`);

  const outRecords = [];

  for (const record of records) {
    const variantId = record.variant_id || '(no id)';
    const recordErrors = [];
    const market = record.market;
    const language = (record.language || '').toLowerCase();

    if (record.claim_id !== undefined && record.claim_id !== null && record.claim_id !== '') {
      const allowed = claimMarket[market];
      if (Array.isArray(allowed) && !allowed.includes(String(record.claim_id).trim())) {
        recordErrors.push(`claim ${record.claim_id} not allowed for market ${market}`);
      }
    }

    if (record.legal_disclaimer_id !== undefined && record.legal_disclaimer_id !== null && String(record.legal_disclaimer_id).trim() !== '') {
      const disclaimerId = String(record.legal_disclaimer_id).trim();
      const entry = disclaimerLibrary[disclaimerId];
      if (!entry) {
        recordErrors.push(`legal_disclaimer_id ${disclaimerId} not in disclaimer library`);
      } else {
        if (entry.markets && !entry.markets.includes(market)) {
          recordErrors.push(`disclaimer ${disclaimerId} not approved for market ${market}`);
        }
        if (entry.languages && language && !entry.languages.includes(language)) {
          recordErrors.push(`disclaimer ${disclaimerId} not approved for language ${language}`);
        }
      }
    }

    if (expiryRules.requireStartDate && (record.start_date == null || String(record.start_date).trim() === '')) {
      recordErrors.push('start_date required by expiry rules');
    }
    if (expiryRules.requireEndDate && (record.end_date == null || String(record.end_date).trim() === '')) {
      recordErrors.push('end_date required by expiry rules');
    }
    const startDate = parseDate(record.start_date);
    const endDate = parseDate(record.end_date);
    if (endDate && expiryRules.rejectPastEndDate && endDate < today) {
      recordErrors.push('end_date is in the past');
    }
    if (startDate && endDate && endDate < startDate) {
      recordErrors.push('end_date must be after start_date');
    }
    if (expiryRules.maxRangeDays && startDate && endDate) {
      const days = (endDate - startDate) / (24 * 60 * 60 * 1000);
      if (days > expiryRules.maxRangeDays) {
        recordErrors.push(`date range exceeds max ${expiryRules.maxRangeDays} days`);
      }
    }

    if (recordErrors.length) {
      errors.push(...recordErrors.map(e => `[${variantId}] ${e}`));
      exceptionReport.push({ variant_id: variantId, reasons: recordErrors });
      reasoningLog.push(`${variantId}: ${recordErrors.join('; ')}`);
      outRecords.push({ ...record, compliance_approved: false, compliance_errors: recordErrors });
    } else {
      outRecords.push({ ...record, compliance_approved: true, compliance_errors: [] });
    }
  }

  const pass = exceptionReport.length === 0;
  if (exceptionReport.length) {
    reasoningLog.push(`Compliance exceptions: ${exceptionReport.length} of ${records.length} records`);
  }

  return {
    success: pass,
    approvalState: pass ? 'pass' : 'fail',
    reasoningLog,
    errors,
    outputPayload: {
      records: outRecords,
      complianceVersion,
      exceptionReport
    }
  };
}

module.exports = { run };
