/**
 * Templatisation Build skill: generates template PSD spec, format risk categories, conceptual variant log.
 * Stories: P1, P2, P3
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, 'templates');

const meta = {
  id: 'templatisation-build',
  name: 'Production Build',
  phase: 3,
  description: 'Generates template master PSD specification, categorises format risk, and logs conceptual variants',
  dependsOn: ['templatisation-guardrails'],
  gates: []
};

/**
 * @param {Object} payload - { projectConfig, framework?, namingReport?, psdInstructions? }
 * @param {Object} context - { runId, outputDir }
 */
function run(payload, context) {
  const reasoningLog = [];
  const errors = [];
  const artifacts = {};
  const projectConfig = payload.projectConfig || {};
  const outputDir = context.outputDir || path.join(process.cwd(), 'output', 'skills', 'build');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const framework = payload.framework || { sacred: { elements: [] }, flexible: { elements: [] }, sku: { elements: [] } };
  const formats = projectConfig.formats || [];
  const riskRules = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, 'format-risk.json'), 'utf8'));

  // P1 — Generate template master PSD specification (JSON manifest, not actual PSD)
  const templateSpec = {
    projectName: projectConfig.projectName || 'unnamed',
    brand: projectConfig.brand || '',
    layers: {
      sacred: framework.sacred.elements.map(e => ({
        name: e.suggestedLayerName || e.name,
        locked: true,
        smartObject: false
      })),
      flexible: framework.flexible.elements.map(e => ({
        name: e.suggestedLayerName || e.name,
        locked: false,
        smartObject: false
      })),
      sku: framework.sku.elements.map(e => ({
        name: e.suggestedLayerName || e.name,
        locked: false,
        smartObject: true
      }))
    },
    psdInstructions: payload.psdInstructions || null
  };

  const templateSpecPath = path.join(outputDir, 'template-master-spec.json');
  fs.writeFileSync(templateSpecPath, JSON.stringify(templateSpec, null, 2), 'utf8');
  artifacts[templateSpecPath] = 'Template master PSD specification';
  reasoningLog.push(`Template spec: ${templateSpec.layers.sacred.length} sacred, ${templateSpec.layers.flexible.length} flexible, ${templateSpec.layers.sku.length} SKU layers`);

  // P2 — Categorise format risk
  const formatRiskResults = formats.map(format => {
    const risk = categoriseFormatRisk(format, riskRules);
    return {
      formatId: format.id,
      formatName: format.name,
      dimensions: format.dimensions,
      riskLevel: risk.level,
      riskReasons: risk.reasons
    };
  });

  const riskPath = path.join(outputDir, 'format-risk-assessment.json');
  fs.writeFileSync(riskPath, JSON.stringify(formatRiskResults, null, 2), 'utf8');
  artifacts[riskPath] = 'Format risk assessment';

  const riskCounts = { Low: 0, Medium: 0, High: 0 };
  for (const f of formatRiskResults) riskCounts[f.riskLevel] = (riskCounts[f.riskLevel] || 0) + 1;
  reasoningLog.push(`Format risk: ${riskCounts.Low} low, ${riskCounts.Medium} medium, ${riskCounts.High} high`);

  // P3 — Record conceptual variants
  const conceptualVariants = identifyConceptualVariants(formats);
  const variantLogPath = path.join(outputDir, 'conceptual-variant-log.json');
  fs.writeFileSync(variantLogPath, JSON.stringify({ entries: conceptualVariants }, null, 2), 'utf8');
  artifacts[variantLogPath] = 'Conceptual variant log';
  reasoningLog.push(`${conceptualVariants.length} conceptual variant groups identified`);

  return {
    success: true,
    approvalState: riskCounts.High > 0 ? 'warning' : 'pass',
    reasoningLog,
    errors,
    outputPayload: {
      buildDir: outputDir,
      templateSpec,
      formatRiskResults,
      conceptualVariants
    },
    artifacts
  };
}

/**
 * Categorise a format's production risk based on rules.
 */
function categoriseFormatRisk(format, riskRules) {
  const reasons = [];
  let level = 'Low';
  const dims = parseDimensions(format.dimensions);

  for (const rule of riskRules.rules) {
    let triggered = false;
    if (rule.condition === 'small_format' && dims && (dims.width < 300 || dims.height < 300)) {
      triggered = true;
    } else if (rule.condition === 'extreme_aspect_ratio' && dims) {
      const ratio = Math.max(dims.width, dims.height) / Math.min(dims.width, dims.height);
      if (ratio > 4) triggered = true;
    } else if (rule.condition === 'print_format' && format.channel && format.channel.startsWith('print')) {
      triggered = true;
    }

    if (triggered) {
      reasons.push(rule.reason);
      if (riskRules.levels.indexOf(rule.level) > riskRules.levels.indexOf(level)) {
        level = rule.level;
      }
    }
  }

  return { level, reasons };
}

/**
 * Parse dimension string like "1080x1080" or "595x842pt" into { width, height }.
 */
function parseDimensions(dimStr) {
  if (!dimStr) return null;
  const match = dimStr.match(/^(\d+)x(\d+)/);
  if (!match) return null;
  return { width: parseInt(match[1], 10), height: parseInt(match[2], 10) };
}

/**
 * Identify conceptual variant groups from format list.
 * Formats with the same channel but different dimensions are grouped.
 */
function identifyConceptualVariants(formats) {
  const groups = {};
  for (const format of formats) {
    const key = format.channel || 'unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(format);
  }
  return Object.entries(groups)
    .filter(([, fmts]) => fmts.length > 1)
    .map(([channel, fmts]) => ({
      conceptName: channel,
      formatIds: fmts.map(f => f.id),
      differences: 'Dimension and layout variations within same channel',
      notes: `${fmts.length} formats share channel "${channel}"`
    }));
}

module.exports = { run, meta };
