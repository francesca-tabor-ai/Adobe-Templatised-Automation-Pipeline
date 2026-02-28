/**
 * Render Orchestration Agent: prepares run config and job manifest for Adobe execution.
 * Does not invoke .jsx; that remains manual or via ESTK/CEP if available.
 */

const path = require('path');
const fs = require('fs');
const { writeRunConfig } = require('../src/runner');

const REPO_ROOT = path.resolve(__dirname, '../../..');

function run(payload, context) {
  const runOptions = payload.runOptions;
  const jobDir = payload.jobDir;
  const jobManifest = payload.jobManifest;
  const appPath = context.app;
  const runId = context.runId;

  if (!runOptions || !jobDir || !jobManifest) {
    return {
      success: false,
      approvalState: 'fail',
      reasoningLog: ['Missing runOptions, jobDir, or jobManifest in payload'],
      errors: ['Invalid payload for render orchestration']
    };
  }

  try {
    writeRunConfig(appPath, runOptions);
    if (!fs.existsSync(jobDir)) fs.mkdirSync(jobDir, { recursive: true });
    fs.writeFileSync(
      path.join(jobDir, 'job.json'),
      JSON.stringify(jobManifest, null, 2),
      'utf8'
    );
  } catch (e) {
    return {
      success: false,
      approvalState: 'fail',
      reasoningLog: [`Failed to write run config or job manifest: ${e.message}`],
      errors: [e.message]
    };
  }

  return {
    success: true,
    approvalState: 'pass',
    reasoningLog: [
      `Render orchestration requested for ${payload.records ? payload.records.length : 0} variants`,
      `Job manifest: ${path.join(jobDir, 'job.json')}`
    ],
    errors: [],
    outputPayload: { jobDir, runOptions }
  };
}

module.exports = { run };
