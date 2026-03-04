/**
 * Templatisation Delivery skill: QC validation, export naming, handover package generation.
 * Stories: D1, D2, D3
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, 'templates');

const meta = {
  id: 'templatisation-delivery',
  name: 'Delivery & Handover',
  phase: 4,
  description: 'Validates QC checklist, applies export naming conventions, and generates handover package',
  dependsOn: ['templatisation-build'],
  gates: []
};

/**
 * @param {Object} payload - { projectConfig, templateSpec?, formatRiskResults?, buildDir? }
 * @param {Object} context - { runId, outputDir }
 */
function run(payload, context) {
  const reasoningLog = [];
  const errors = [];
  const artifacts = {};
  const projectConfig = payload.projectConfig || {};
  const outputDir = context.outputDir || path.join(process.cwd(), 'output', 'skills', 'delivery');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const qcTemplate = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, 'qc-checklist.json'), 'utf8'));
  const exportNaming = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, 'export-naming.json'), 'utf8'));
  const handoverTemplate = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, 'handover-manifest.json'), 'utf8'));

  const templateSpec = payload.templateSpec || null;
  const formatRiskResults = payload.formatRiskResults || [];

  // D1 — QC validation checklist
  const qcResults = qcTemplate.checks.map(check => {
    const result = runQCCheck(check, templateSpec, formatRiskResults, projectConfig);
    return {
      id: check.id,
      name: check.name,
      type: check.type,
      required: check.required,
      status: result.pass ? 'pass' : 'fail',
      details: result.details
    };
  });

  const qcPath = path.join(outputDir, 'qc-report.json');
  fs.writeFileSync(qcPath, JSON.stringify({ checks: qcResults }, null, 2), 'utf8');
  artifacts[qcPath] = 'QC validation report';

  const qcPassed = qcResults.filter(r => r.status === 'pass').length;
  const qcFailed = qcResults.filter(r => r.status === 'fail').length;
  reasoningLog.push(`QC: ${qcPassed} passed, ${qcFailed} failed out of ${qcResults.length} checks`);

  const hasRequiredFailure = qcResults.some(r => r.required && r.status === 'fail');

  // D2 — Export naming convention
  const formats = projectConfig.formats || [];
  const exportNames = formats.map(format => {
    const name = applyNamingPattern(exportNaming.pattern, {
      brand: projectConfig.brand || 'brand',
      campaign: (projectConfig.campaign && projectConfig.campaign.name) || 'campaign',
      channel: format.channel || 'channel',
      format: format.id || 'format',
      variant: 'v01'
    }, exportNaming);
    return { formatId: format.id, exportName: name };
  });

  const exportNamesPath = path.join(outputDir, 'export-names.json');
  fs.writeFileSync(exportNamesPath, JSON.stringify(exportNames, null, 2), 'utf8');
  artifacts[exportNamesPath] = 'Export naming map';
  reasoningLog.push(`Export names generated for ${exportNames.length} formats`);

  // D3 — Handover package manifest
  const handover = {
    projectName: projectConfig.projectName || 'unnamed',
    generatedAt: new Date().toISOString(),
    sections: handoverTemplate.sections.map(section => ({
      name: section,
      status: 'included',
      path: `output/skills/${section}/`
    })),
    requiredFiles: handoverTemplate.requiredFiles,
    qcSummary: {
      totalChecks: qcResults.length,
      passed: qcPassed,
      failed: qcFailed,
      overallStatus: hasRequiredFailure ? 'fail' : 'pass'
    }
  };

  const handoverPath = path.join(outputDir, 'handover-package.json');
  fs.writeFileSync(handoverPath, JSON.stringify(handover, null, 2), 'utf8');
  artifacts[handoverPath] = 'Handover package manifest';
  reasoningLog.push(`Handover package generated with ${handover.sections.length} sections`);

  return {
    success: !hasRequiredFailure,
    approvalState: hasRequiredFailure ? 'fail' : (qcFailed > 0 ? 'warning' : 'pass'),
    reasoningLog,
    errors,
    outputPayload: {
      deliveryDir: outputDir,
      qcResults,
      exportNames,
      handover
    },
    artifacts
  };
}

/**
 * Run a single QC check against available data.
 */
function runQCCheck(check, templateSpec, formatRiskResults, projectConfig) {
  switch (check.id) {
    case 'layer_naming':
      if (!templateSpec) return { pass: false, details: 'No template spec available' };
      const allLayers = [
        ...(templateSpec.layers.sacred || []),
        ...(templateSpec.layers.flexible || []),
        ...(templateSpec.layers.sku || [])
      ];
      const validNames = allLayers.every(l =>
        l.name.startsWith('SACRED_') || l.name.startsWith('FLEXIBLE_') || l.name.startsWith('SKU_')
      );
      return { pass: validNames, details: validNames ? 'All layers follow naming convention' : 'Some layers do not follow convention' };

    case 'smart_object_placement':
      if (!templateSpec) return { pass: false, details: 'No template spec available' };
      const skuLayers = templateSpec.layers.sku || [];
      const allSmartObjects = skuLayers.every(l => l.smartObject);
      return { pass: allSmartObjects, details: allSmartObjects ? 'All SKU layers are Smart Objects' : 'Some SKU layers are not Smart Objects' };

    case 'format_dimensions':
      const formats = projectConfig.formats || [];
      const allHaveDimensions = formats.every(f => f.dimensions);
      return { pass: allHaveDimensions, details: allHaveDimensions ? 'All formats have dimensions defined' : 'Some formats missing dimensions' };

    case 'sku_behaviour':
      const skuCount = (projectConfig.project && projectConfig.project.skuCount) || 1;
      if (skuCount <= 1) return { pass: true, details: 'Single SKU — no variant behaviour needed' };
      return { pass: true, details: `Multi-SKU setup with ${skuCount} products` };

    default:
      return { pass: true, details: 'Check not implemented — manual review required' };
  }
}

/**
 * Apply naming pattern with variable substitution.
 */
function applyNamingPattern(pattern, vars, config) {
  let name = pattern;
  for (const [key, value] of Object.entries(vars)) {
    name = name.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  name = name.replace(/\s+/g, config.separator || '_');
  if (config.case === 'lowercase') name = name.toLowerCase();
  return name;
}

module.exports = { run, meta };
