/**
 * Build instructions to run the correct .jsx in the Adobe host; optionally write run_config.json
 * for the script to read. ExtendScript cannot be invoked from Node without ESTK/bridge.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');
const SCRIPTS = {
  indesign: path.join(REPO_ROOT, 'scripts/indesign/run_merge.jsx'),
  photoshop: path.join(REPO_ROOT, 'scripts/photoshop/run_batch.jsx'),
  aftereffects: path.join(REPO_ROOT, 'scripts/aftereffects/run_render.jsx')
};

/**
 * Write a run config file that the .jsx can read (if we add config reading in .jsx) or that
 * documents the paths for this run.
 */
function writeRunConfig(appPath, options = {}) {
  const configPath = options.configPath || path.join(REPO_ROOT, 'output', appPath, 'run_config.json');
  const dataPath = options.dataPath || path.join(REPO_ROOT, 'data/sample', appPath === 'indesign' ? 'variants.csv' : 'variants.json');
  const templatePath = options.templatePath || path.join(REPO_ROOT, 'templates', appPath, appPath === 'indesign' ? 'master.indd' : appPath === 'photoshop' ? 'master.psd' : 'master.aep');
  const outputFolder = options.outputFolder || path.join(REPO_ROOT, 'output', appPath);
  const approvedOnly = options.approvedOnly === true;

  const config = {
    csvPath: appPath === 'indesign' ? dataPath : null,
    jsonPath: appPath !== 'indesign' ? dataPath : null,
    dataPath,
    templatePath,
    outputFolder,
    approvedOnly
  };
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  return configPath;
}

/**
 * Return instructions string for the user to run the script from the Adobe app.
 */
function getRunInstructions(appPath, options = {}) {
  const scriptPath = SCRIPTS[appPath];
  if (!scriptPath || !fs.existsSync(scriptPath)) {
    return `Script not found: ${scriptPath}`;
  }
  const configPath = writeRunConfig(appPath, options);
  const dataPath = options.dataPath || path.join(REPO_ROOT, 'data/sample', appPath === 'indesign' ? 'variants.csv' : 'variants.json');
  const templatePath = options.templatePath || path.join(REPO_ROOT, 'templates', appPath, appPath === 'indesign' ? 'master.indd' : appPath === 'photoshop' ? 'master.psd' : 'master.aep');
  const outputFolder = options.outputFolder || path.join(REPO_ROOT, 'output', appPath);

  return [
    `=== Run ${appPath} pipeline ===`,
    `1. Open ${appPath === 'indesign' ? 'InDesign' : appPath === 'photoshop' ? 'Photoshop' : 'After Effects'}.`,
    `2. File > Scripts > Run Script...`,
    `3. Select: ${scriptPath}`,
    `4. If prompted for arguments, use:`,
    `   Data: ${dataPath}`,
    `   Template: ${templatePath}`,
    `   Output: ${outputFolder}`,
    `   Approved only: ${options.approvedOnly ? 'true' : 'false'}`,
    `5. Run config written to: ${configPath}`,
    `6. After the script finishes, run: node run_pipeline.js --path ${appPath} --qa-only to aggregate QA.`
  ].join('\n');
}

module.exports = { getRunInstructions, writeRunConfig, SCRIPTS, REPO_ROOT };
