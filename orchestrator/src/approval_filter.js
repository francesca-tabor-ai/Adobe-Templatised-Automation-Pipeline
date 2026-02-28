/**
 * Read CSV or JSON variant dataset, filter by approved, write filtered file for this run.
 * Uses Node fs/path only.
 */

const fs = require('fs');
const path = require('path');

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCSVRow(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVRow(lines[i]);
    const obj = {};
    headers.forEach((h, j) => { obj[h] = vals[j] !== undefined ? vals[j] : ''; });
    rows.push(obj);
  }
  return rows;
}

function parseCSVRow(line) {
  const out = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      i++;
      let end = '';
      while (i < line.length) {
        if (line[i] === '"') {
          i++;
          if (line[i] === '"') { end += '"'; i++; }
          else break;
        } else { end += line[i]; i++; }
      }
      out.push(end);
      if (line[i] === ',') i++;
    } else {
      const next = line.indexOf(',', i);
      if (next === -1) { out.push(line.slice(i)); break; }
      out.push(line.slice(i, next));
      i = next + 1;
    }
  }
  return out;
}

function recordsToCSV(records) {
  if (!records || records.length === 0) return '';
  const headers = Object.keys(records[0]);
  const lines = [headers.join(',')];
  records.forEach(rec => {
    const row = headers.map(h => {
      let v = rec[h];
      if (v == null) v = '';
      v = String(v);
      if (/[,"\n]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"';
      return v;
    });
    lines.push(row.join(','));
  });
  return lines.join('\n');
}

function parseBool(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v.toLowerCase() === 'true' || v === '1';
  return Boolean(v);
}

/**
 * Load variants from path (CSV or JSON), optionally filter by approved, write to outPath.
 * @param {string} dataPath - path to variants.csv or variants.json
 * @param {string} outPath - path to write filtered data (same format as input)
 * @param {{ approvedOnly: boolean }} options
 * @returns {{ records: Array, path: string, filtered: boolean }}
 */
function filterAndWrite(dataPath, outPath, options = {}) {
  const resolved = path.resolve(dataPath);
  const text = fs.readFileSync(resolved, 'utf8');
  const isJSON = /\.json$/i.test(resolved);
  let records = isJSON ? JSON.parse(text) : parseCSV(text);
  if (!Array.isArray(records)) records = [records];

  const approvedOnly = options.approvedOnly === true;
  const originalCount = records.length;
  if (approvedOnly) {
    records = records.filter(r => parseBool(r.approved));
  }

  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  if (isJSON) {
    fs.writeFileSync(outPath, JSON.stringify(records, null, 2), 'utf8');
  } else {
    fs.writeFileSync(outPath, recordsToCSV(records), 'utf8');
  }

  return { records, path: outPath, filtered: approvedOnly, originalCount, filteredCount: records.length };
}

module.exports = { filterAndWrite, parseCSV, parseBool, recordsToCSV };
