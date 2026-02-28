/**
 * Shared ExtendScript helpers: file I/O, CSV parse, JSON parse.
 * Compatible with InDesign, Photoshop, After Effects (ES3-like).
 */

/**
 * Read entire file as string. Path can be File object or path string.
 * @param {string|File} pathOrFile
 * @returns {string}
 */
function readFile(pathOrFile) {
  var f = pathOrFile instanceof File ? pathOrFile : new File(pathOrFile);
  if (!f.exists) return '';
  f.encoding = 'UTF-8';
  f.open('r');
  var s = f.read();
  f.close();
  return s;
}

/**
 * Write string to file. Creates parent folders if needed.
 * @param {string|File} pathOrFile
 * @param {string} content
 */
function writeFile(pathOrFile, content) {
  var f = pathOrFile instanceof File ? pathOrFile : new File(pathOrFile);
  if (f.parent && !f.parent.exists) f.parent.create();
  f.encoding = 'UTF-8';
  f.open('w');
  f.write(content);
  f.close();
}

/**
 * Parse CSV string into array of objects (first row = headers).
 * Handles quoted fields with commas.
 * @param {string} csv
 * @returns {Array.<Object>}
 */
function parseCSV(csv) {
  var lines = csv.split(/\r?\n/);
  if (lines.length < 2) return [];
  var headers = parseCSVRow(lines[0]);
  var rows = [];
  for (var i = 1; i < lines.length; i++) {
    if (lines[i].length === 0) continue;
    var vals = parseCSVRow(lines[i]);
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = vals[j] !== undefined ? vals[j] : '';
    }
    rows.push(obj);
  }
  return rows;
}

/**
 * Parse a single CSV row respecting double-quoted fields.
 * @param {string} line
 * @returns {Array.<string>}
 */
function parseCSVRow(line) {
  var out = [];
  var i = 0;
  while (i < line.length) {
    if (line.charAt(i) === '"') {
      i++;
      var end = '';
      while (i < line.length) {
        if (line.charAt(i) === '"') {
          i++;
          if (line.charAt(i) === '"') { end += '"'; i++; }
          else break;
        } else {
          end += line.charAt(i);
          i++;
        }
      }
      out.push(end);
      if (line.charAt(i) === ',') i++;
    } else {
      var next = line.indexOf(',', i);
      if (next === -1) {
        out.push(line.substring(i));
        break;
      }
      out.push(line.substring(i, next));
      i = next + 1;
    }
  }
  return out;
}

/**
 * Parse JSON string. Uses eval for ES3 hosts that lack JSON.parse.
 * Only use with trusted content (e.g. your own data files).
 * @param {string} str
 * @returns {Object|Array}
 */
function parseJSON(str) {
  if (typeof JSON !== 'undefined' && typeof JSON.parse === 'function') {
    return JSON.parse(str);
  }
  return eval('(' + str + ')');
}

/**
 * Serialize object to JSON string. Uses JSON.stringify if available.
 * @param {Object|Array} obj
 * @returns {string}
 */
function stringifyJSON(obj) {
  if (typeof JSON !== 'undefined' && typeof JSON.stringify === 'function') {
    return JSON.stringify(obj);
  }
  // Minimal fallback for arrays of plain objects
  if (obj instanceof Array) {
    var parts = [];
    for (var i = 0; i < obj.length; i++) parts.push(stringifyJSON(obj[i]));
    return '[' + parts.join(',') + ']';
  }
  if (typeof obj === 'object' && obj !== null) {
    var pairs = [];
    for (var k in obj) if (obj.hasOwnProperty(k)) {
      pairs.push('"' + escapeJSONString(k) + '":' + stringifyJSON(obj[k]));
    }
    return '{' + pairs.join(',') + '}';
  }
  if (typeof obj === 'string') return '"' + escapeJSONString(obj) + '"';
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (obj === null) return 'null';
  return 'null';
}

function escapeJSONString(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Serialize array of record objects to CSV (first row = headers).
 * @param {Array.<Object>} records
 * @returns {string}
 */
function recordsToCSV(records) {
  if (!records || records.length === 0) return '';
  var headers = [];
  for (var k in records[0]) if (records[0].hasOwnProperty(k)) headers.push(k);
  var lines = [headers.join(',')];
  for (var i = 0; i < records.length; i++) {
    var row = [];
    for (var h = 0; h < headers.length; h++) {
      var v = records[i][headers[h]];
      if (v === undefined || v === null) v = '';
      v = String(v);
      if (v.indexOf(',') >= 0 || v.indexOf('"') >= 0 || v.indexOf('\n') >= 0) {
        v = '"' + v.replace(/"/g, '""') + '"';
      }
      row.push(v);
    }
    lines.push(row.join(','));
  }
  return lines.join('\n');
}

/**
 * Normalize boolean from string (e.g. CSV "true"/"false") or value.
 * @param {*} v
 * @returns {boolean}
 */
function parseBool(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v.toLowerCase() === 'true' || v === '1';
  return !!v;
}
