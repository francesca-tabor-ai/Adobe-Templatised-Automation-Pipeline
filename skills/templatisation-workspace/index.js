/**
 * Templatisation Workspace skill: creates project folder structure, format tracking sheet, and evaluates gates.
 * Stories: W1, W2, W3
 */

const fs = require('fs');
const path = require('path');
const { evaluateGates } = require('../common/gate-evaluator');

const TEMPLATES_DIR = path.join(__dirname, 'templates');

const meta = {
  id: 'templatisation-workspace',
  name: 'Workspace Setup',
  phase: 0,
  description: 'Creates project folder structure, format tracking sheet, and evaluates conditional skill gates',
  dependsOn: ['templatisation-comms'],
  gates: []
};

/**
 * @param {Object} payload - { projectConfig, commsOutputDir? }
 * @param {Object} context - { runId, outputDir }
 */
function run(payload, context) {
  const reasoningLog = [];
  const errors = [];
  const artifacts = {};
  const projectConfig = payload.projectConfig || {};
  const outputDir = context.outputDir || path.join(process.cwd(), 'output', 'skills', 'workspace');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // W1 — Create folder structure
  try {
    const folderTemplate = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, 'folder-structure.json'), 'utf8'));
    const projectDir = path.join(outputDir, projectConfig.projectName || 'project');
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    for (const dir of folderTemplate.directories) {
      const dirPath = path.join(projectDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      artifacts[dirPath] = `Project directory: ${dir}`;
    }
    reasoningLog.push(`Folder structure created at ${projectDir} with ${folderTemplate.directories.length} directories`);
  } catch (err) {
    errors.push(`Folder structure creation failed: ${err.message}`);
  }

  // W2 — Generate format tracking CSV
  try {
    const trackingTemplate = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, 'format-tracking.json'), 'utf8'));
    const formats = projectConfig.formats || [];
    const columns = trackingTemplate.columns;
    const rows = [columns.join(',')];
    for (const format of formats) {
      const row = columns.map(col => {
        switch (col) {
          case 'format_id': return format.id || '';
          case 'format_name': return format.name || '';
          case 'dimensions': return format.dimensions || '';
          case 'channel': return format.channel || '';
          case 'sku_applicability': return format.skuApplicability || '';
          case 'risk_level': return '';
          case 'status': return 'pending';
          default: return '';
        }
      });
      rows.push(row.join(','));
    }
    const csvPath = path.join(outputDir, 'format-tracking.csv');
    fs.writeFileSync(csvPath, rows.join('\n'), 'utf8');
    artifacts[csvPath] = 'Format tracking sheet';
    reasoningLog.push(`Format tracking CSV generated with ${formats.length} formats`);
  } catch (err) {
    errors.push(`Format tracking generation failed: ${err.message}`);
  }

  // W3 — Evaluate conditional skill gates
  const gateResults = {};
  const iridescentGates = [{ field: 'campaign.hasIridescentEffects', operator: 'equals', value: true }];
  const multiSkuGates = [{ field: 'project.skuCount', operator: 'greaterThan', value: 1 }];

  const iridescentResult = evaluateGates(iridescentGates, projectConfig);
  gateResults['templatisation-iridescent'] = iridescentResult.pass;
  reasoningLog.push(`Gate: templatisation-iridescent = ${iridescentResult.pass} (hasIridescentEffects=${projectConfig.campaign ? projectConfig.campaign.hasIridescentEffects : 'N/A'})`);

  const multiSkuResult = evaluateGates(multiSkuGates, projectConfig);
  gateResults['templatisation-multisku'] = multiSkuResult.pass;
  reasoningLog.push(`Gate: templatisation-multisku = ${multiSkuResult.pass} (skuCount=${projectConfig.project ? projectConfig.project.skuCount : 'N/A'})`);

  return {
    success: errors.length === 0,
    approvalState: errors.length === 0 ? 'pass' : 'warning',
    reasoningLog,
    errors,
    outputPayload: {
      workspaceDir: outputDir,
      gateResults
    },
    artifacts
  };
}

module.exports = { run, meta };
