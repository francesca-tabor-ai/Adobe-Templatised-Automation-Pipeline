/**
 * Templatisation Iridescent skill: defines gradient rules, smart object strategy, export settings for iridescent effects.
 * Stories: I1, I2
 * Conditional: activated when campaign.hasIridescentEffects === true
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, 'templates');

const meta = {
  id: 'templatisation-iridescent',
  name: 'Iridescent Systems',
  phase: 3,
  description: 'Defines gradient rules, smart object strategy, and export settings for iridescent/gradient effects',
  dependsOn: ['templatisation-guardrails'],
  gates: [
    { field: 'campaign.hasIridescentEffects', operator: 'equals', value: true }
  ]
};

/**
 * @param {Object} payload - { projectConfig, framework? }
 * @param {Object} context - { runId, outputDir }
 */
function run(payload, context) {
  const reasoningLog = [];
  const errors = [];
  const artifacts = {};
  const projectConfig = payload.projectConfig || {};
  const outputDir = context.outputDir || path.join(process.cwd(), 'output', 'skills', 'iridescent');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const systemTemplate = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, 'iridescent-system.json'), 'utf8'));
  const channels = (projectConfig.campaign && projectConfig.campaign.channels) || [];

  // I2 — Define gradient rules
  const gradientRules = {
    colourStops: systemTemplate.colourStops,
    gradientAngles: systemTemplate.gradientAngles,
    blendMode: systemTemplate.blendMode,
    opacity: systemTemplate.opacity
  };

  const gradientRulesPath = path.join(outputDir, 'gradient-rules.json');
  fs.writeFileSync(gradientRulesPath, JSON.stringify(gradientRules, null, 2), 'utf8');
  artifacts[gradientRulesPath] = 'Gradient rules for iridescent effects';
  reasoningLog.push(`Gradient rules defined with ${gradientRules.colourStops.length} colour stops`);

  // Smart object strategy
  const smartObjectStrategy = {
    method: 'linked_smart_object',
    description: 'Iridescent overlay is a linked Smart Object so gradient updates propagate across all formats',
    layerName: 'SACRED_IRIDESCENT_OVERLAY',
    updateMethod: 'Edit Smart Object source to update gradient across all instances'
  };

  const smartObjPath = path.join(outputDir, 'smart-object-strategy.json');
  fs.writeFileSync(smartObjPath, JSON.stringify(smartObjectStrategy, null, 2), 'utf8');
  artifacts[smartObjPath] = 'Smart object strategy for iridescent overlay';
  reasoningLog.push('Smart object strategy: linked Smart Object for gradient propagation');

  // Export settings by channel
  const exportSettings = channels.map(channel => ({
    channel,
    colourSpace: channel.startsWith('print') ? 'CMYK' : 'sRGB',
    gradientResolution: channel.startsWith('print') ? '300dpi' : '72dpi',
    notes: channel.startsWith('print')
      ? 'Iridescent effects may require spot colour simulation for print'
      : 'sRGB ensures web-safe gradient rendering'
  }));

  const exportPath = path.join(outputDir, 'export-settings-by-channel.json');
  fs.writeFileSync(exportPath, JSON.stringify(exportSettings, null, 2), 'utf8');
  artifacts[exportPath] = 'Export settings per channel for iridescent effects';
  reasoningLog.push(`Export settings defined for ${exportSettings.length} channels`);

  return {
    success: true,
    approvalState: 'pass',
    reasoningLog,
    errors,
    outputPayload: {
      iridescentDir: outputDir,
      gradientRules,
      smartObjectStrategy,
      exportSettings
    },
    artifacts
  };
}

module.exports = { run, meta };
