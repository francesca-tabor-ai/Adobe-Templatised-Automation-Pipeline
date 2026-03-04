/**
 * Templatisation Guardrails skill: creates sacred/flexible framework, layer naming conventions, PSD instructions.
 * Stories: G1, G2, G3
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, 'templates');

const meta = {
  id: 'templatisation-guardrails',
  name: 'Design Rules & Guardrails',
  phase: 2,
  description: 'Formalises sacred/flexible framework, layer naming conventions, and PSD instructions',
  dependsOn: ['templatisation-analysis'],
  gates: []
};

/**
 * @param {Object} payload - { projectConfig, classification?, layerMap? }
 * @param {Object} context - { runId, outputDir }
 */
function run(payload, context) {
  const reasoningLog = [];
  const errors = [];
  const artifacts = {};
  const outputDir = context.outputDir || path.join(process.cwd(), 'output', 'skills', 'guardrails');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const classification = payload.classification || { sacred: [], flexible: [], sku: [], unclassified: [] };
  const layerMap = payload.layerMap || [];
  const namingRules = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, 'layer-naming.json'), 'utf8'));
  const psdInstructions = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, 'psd-instructions.json'), 'utf8'));

  // G1 — Create sacred/flexible framework
  const framework = {
    sacred: {
      description: 'Elements that must not be modified by automation',
      elements: classification.sacred.map(e => ({
        name: e.name,
        suggestedLayerName: toConventionName('SACRED', e.name, namingRules)
      }))
    },
    flexible: {
      description: 'Elements that can be modified by automation (text, colours, positions)',
      elements: classification.flexible.map(e => ({
        name: e.name,
        suggestedLayerName: toConventionName('FLEXIBLE', e.name, namingRules)
      }))
    },
    sku: {
      description: 'Product elements that swap per SKU variant',
      elements: classification.sku.map(e => ({
        name: e.name,
        suggestedLayerName: toConventionName('SKU', e.name, namingRules)
      }))
    }
  };

  const frameworkPath = path.join(outputDir, 'sacred-flexible-framework.json');
  fs.writeFileSync(frameworkPath, JSON.stringify(framework, null, 2), 'utf8');
  artifacts[frameworkPath] = 'Sacred/flexible framework';
  reasoningLog.push(`Framework: ${framework.sacred.elements.length} sacred, ${framework.flexible.elements.length} flexible, ${framework.sku.elements.length} SKU elements`);

  // G2 — Validate layer naming conventions
  const namingReport = { valid: [], invalid: [] };
  for (const layer of layerMap) {
    const isValid = isValidLayerName(layer.name, namingRules);
    if (isValid) {
      namingReport.valid.push(layer.name);
    } else {
      namingReport.invalid.push({
        current: layer.name,
        suggested: suggestLayerName(layer.name, classification, namingRules)
      });
    }
  }

  const namingReportPath = path.join(outputDir, 'layer-naming-report.json');
  fs.writeFileSync(namingReportPath, JSON.stringify(namingReport, null, 2), 'utf8');
  artifacts[namingReportPath] = 'Layer naming validation report';
  reasoningLog.push(`Layer naming: ${namingReport.valid.length} valid, ${namingReport.invalid.length} need renaming`);

  // G3 — Generate PSD instruction metadata
  const instructions = {
    layerGroupName: psdInstructions.layerGroupName,
    visibility: psdInstructions.visibility,
    instructions: [
      ...psdInstructions.instructions,
      {
        title: 'Sacred Elements',
        content: `Do NOT modify: ${framework.sacred.elements.map(e => e.suggestedLayerName).join(', ')}`
      },
      {
        title: 'Flexible Elements',
        content: `These elements can be changed: ${framework.flexible.elements.map(e => e.suggestedLayerName).join(', ')}`
      },
      {
        title: 'SKU Elements',
        content: `Product swap layers: ${framework.sku.elements.map(e => e.suggestedLayerName).join(', ')}`
      }
    ]
  };

  const instructionsPath = path.join(outputDir, 'psd-instructions.json');
  fs.writeFileSync(instructionsPath, JSON.stringify(instructions, null, 2), 'utf8');
  artifacts[instructionsPath] = 'PSD embedded instructions';
  reasoningLog.push('PSD instruction metadata generated for hidden layer group');

  return {
    success: true,
    approvalState: namingReport.invalid.length > 0 ? 'warning' : 'pass',
    reasoningLog,
    errors,
    outputPayload: {
      guardrailsDir: outputDir,
      framework,
      namingReport,
      psdInstructions: instructions
    },
    artifacts
  };
}

/**
 * Convert a layer name to convention format: PREFIX_DESCRIPTION
 */
function toConventionName(prefix, layerName, namingRules) {
  const clean = layerName.replace(/^(SACRED_|FLEXIBLE_|SKU_)/, '').replace(/\s+/g, '_').toUpperCase();
  return `${prefix}_${clean}`;
}

/**
 * Check if a layer name follows naming conventions.
 */
function isValidLayerName(name, namingRules) {
  const allPrefixes = [
    ...namingRules.conventions.sacred.prefixes,
    ...namingRules.conventions.flexible.prefixes,
    ...namingRules.conventions.sku.prefixes
  ];
  return allPrefixes.some(prefix => name.startsWith(prefix));
}

/**
 * Suggest a proper layer name based on classification.
 */
function suggestLayerName(name, classification, namingRules) {
  const isSacred = classification.sacred.some(e => e.name === name);
  const isFlexible = classification.flexible.some(e => e.name === name);
  const isSku = classification.sku.some(e => e.name === name);

  if (isSacred) return toConventionName('SACRED', name, namingRules);
  if (isSku) return toConventionName('SKU', name, namingRules);
  if (isFlexible) return toConventionName('FLEXIBLE', name, namingRules);
  return name;
}

module.exports = { run, meta };
