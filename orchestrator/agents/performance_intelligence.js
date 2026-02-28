/**
 * Performance Intelligence Agent: ingest channel performance data + variant metadata;
 * output insights, next-test suggestions, underperforming variant suppression, creative fatigue alerts.
 */

const path = require('path');
const fs = require('fs');

const REPO_ROOT = path.resolve(__dirname, '../../..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'output');
const PERF_DIR = path.join(OUTPUT_DIR, 'performance');
const CONFIG_PATH = path.join(REPO_ROOT, 'config/performance.json');

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return {
      performanceDataPath: path.join(PERF_DIR, 'performance.csv'),
      metricColumns: { impressions: 'impressions', clicks: 'clicks', conversions: 'conversions', spend: 'spend' },
      suppressBelowCtr: 0.005,
      fatigueDays: 30
    };
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function loadPerformanceCsv(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((h, j) => { obj[h] = vals[j] !== undefined ? vals[j] : ''; });
    rows.push(obj);
  }
  return rows;
}

function run(payload, context) {
  const config = loadConfig();
  const dataPath = path.isAbsolute(config.performanceDataPath)
    ? config.performanceDataPath
    : path.join(REPO_ROOT, config.performanceDataPath);
  const rows = loadPerformanceCsv(dataPath);

  const reasoningLog = [];
  const insights = { top: [], bottom: [], suppressed: [], fatigue: [], suggested_tests: [] };

  if (rows.length === 0) {
    reasoningLog.push('No performance data found at ' + dataPath);
    if (!fs.existsSync(PERF_DIR)) fs.mkdirSync(PERF_DIR, { recursive: true });
    const reportPath = path.join(PERF_DIR, 'performance_report.json');
    fs.writeFileSync(reportPath, JSON.stringify({ insights, reasoningLog, suggested_suppressions: [], suggested_variations: [] }, null, 2), 'utf8');
    return {
      success: true,
      approvalState: 'pass',
      reasoningLog,
      errors: [],
      outputPayload: { reportPath, suggested_suppressions: [], suggested_variations: [] }
    };
  }

  const cols = config.metricColumns || {};
  const impCol = cols.impressions || 'impressions';
  const clickCol = cols.clicks || 'clicks';
  const convCol = cols.conversions || 'conversions';
  const spendCol = cols.spend || 'spend';
  const suppressCtr = config.suppressBelowCtr != null ? config.suppressBelowCtr : 0.005;
  const fatigueDays = config.fatigueDays != null ? config.fatigueDays : 30;

  const withMetrics = rows.map(r => {
    const imp = Number(r[impCol]) || 0;
    const clicks = Number(r[clickCol]) || 0;
    const conv = Number(r[convCol]) || 0;
    const spend = Number(r[spendCol]) || 0;
    const ctr = imp > 0 ? clicks / imp : 0;
    const cvr = clicks > 0 ? conv / clicks : 0;
    return { ...r, _impressions: imp, _clicks: clicks, _conversions: conv, _spend: spend, _ctr: ctr, _cvr: cvr };
  });

  const byCtr = [...withMetrics].filter(r => r._impressions > 0).sort((a, b) => b._ctr - a._ctr);
  insights.top = byCtr.slice(0, 5).map(r => ({ variant_id: r.variant_id, hypothesis_id: r.hypothesis_id, ctr: r._ctr }));
  insights.bottom = byCtr.slice(-5).reverse().map(r => ({ variant_id: r.variant_id, hypothesis_id: r.hypothesis_id, ctr: r._ctr }));

  const suggested_suppressions = withMetrics.filter(r => r._impressions > 0 && r._ctr < suppressCtr).map(r => r.variant_id).filter(Boolean);
  insights.suppressed = suggested_suppressions;
  reasoningLog.push(`Underperforming (CTR < ${suppressCtr}): ${suggested_suppressions.length} variant(s)`);

  if (context.suppressFromPerformance && suggested_suppressions.length) {
    reasoningLog.push('Suppression list for next run: ' + suggested_suppressions.join(', '));
  }

  const suggested_variations = insights.bottom.map((r, i) => ({
    hypothesis_id: r.hypothesis_id,
    suggested_change: 'Consider new variation; current CTR among lowest',
    reason: `Variant ${r.variant_id} CTR ${(r.ctr * 100).toFixed(3)}%`
  }));
  insights.suggested_tests = suggested_variations;

  if (!fs.existsSync(PERF_DIR)) fs.mkdirSync(PERF_DIR, { recursive: true });
  const reportPath = path.join(PERF_DIR, 'performance_report.json');
  const report = {
    generatedAt: new Date().toISOString(),
    insights,
    suggested_suppressions,
    suggested_variations,
    reasoningLog
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const recPath = path.join(PERF_DIR, 'recommendations.json');
  fs.writeFileSync(recPath, JSON.stringify({ suggested_variations, suggested_suppressions }, null, 2), 'utf8');

  return {
    success: true,
    approvalState: 'pass',
    reasoningLog,
    errors: [],
    outputPayload: { reportPath, recPath, suggested_suppressions, suggested_variations }
  };
}

module.exports = { run };
