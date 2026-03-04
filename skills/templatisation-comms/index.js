/**
 * Templatisation Comms skill: generates contact map, email templates, and escalation protocols.
 * Stories: C1, C2, C3
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, 'templates');

const meta = {
  id: 'templatisation-comms',
  name: 'Communications Setup',
  phase: 0,
  description: 'Creates contact map, email templates, and escalation protocols for the project',
  dependsOn: [],
  gates: []
};

/**
 * @param {Object} payload - { projectConfig, workspacePath? }
 * @param {Object} context - { runId, outputDir }
 * @returns {import('../common/skill-contract').SkillResult}
 */
function run(payload, context) {
  const reasoningLog = [];
  const errors = [];
  const artifacts = {};
  const projectConfig = payload.projectConfig || {};
  const outputDir = context.outputDir || path.join(process.cwd(), 'output', 'skills', 'comms');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // C1 — Generate contact map
  try {
    const contactMapTemplate = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, 'contact-map.json'), 'utf8'));
    const contacts = projectConfig.contacts || {};
    for (const stakeholder of contactMapTemplate.stakeholders) {
      const contactData = contacts[stakeholder.role];
      if (contactData) {
        stakeholder.name = contactData.name || '';
        stakeholder.email = contactData.email || '';
      }
    }
    const contactMapPath = path.join(outputDir, 'contact-map.json');
    fs.writeFileSync(contactMapPath, JSON.stringify(contactMapTemplate, null, 2), 'utf8');
    artifacts[contactMapPath] = 'Populated contact map';
    reasoningLog.push('Contact map generated with project stakeholders');
  } catch (err) {
    errors.push(`Contact map generation failed: ${err.message}`);
  }

  // C2 — Copy email templates
  const emailTemplatesDir = path.join(TEMPLATES_DIR, 'email-templates');
  const emailOutputDir = path.join(outputDir, 'email-templates');
  if (!fs.existsSync(emailOutputDir)) {
    fs.mkdirSync(emailOutputDir, { recursive: true });
  }
  const emailTypes = ['kickoff', 'review-request', 'escalation', 'handover'];
  for (const emailType of emailTypes) {
    try {
      const src = path.join(emailTemplatesDir, `${emailType}.json`);
      if (fs.existsSync(src)) {
        const template = JSON.parse(fs.readFileSync(src, 'utf8'));
        const dest = path.join(emailOutputDir, `${emailType}.json`);
        fs.writeFileSync(dest, JSON.stringify(template, null, 2), 'utf8');
        artifacts[dest] = `Email template: ${emailType}`;
        reasoningLog.push(`Email template '${emailType}' copied to workspace`);
      } else {
        errors.push(`Email template missing: ${emailType}.json`);
      }
    } catch (err) {
      errors.push(`Email template '${emailType}' failed: ${err.message}`);
    }
  }

  // C3 — Copy escalation protocols
  try {
    const escSrc = path.join(TEMPLATES_DIR, 'escalation-protocols.json');
    if (fs.existsSync(escSrc)) {
      const protocols = JSON.parse(fs.readFileSync(escSrc, 'utf8'));
      const escDest = path.join(outputDir, 'escalation-protocols.json');
      fs.writeFileSync(escDest, JSON.stringify(protocols, null, 2), 'utf8');
      artifacts[escDest] = 'Escalation protocols';
      reasoningLog.push('Escalation protocols copied to workspace');
    } else {
      errors.push('Escalation protocols template missing');
    }
  } catch (err) {
    errors.push(`Escalation protocols failed: ${err.message}`);
  }

  return {
    success: errors.length === 0,
    approvalState: errors.length === 0 ? 'pass' : 'warning',
    reasoningLog,
    errors,
    outputPayload: { commsOutputDir: outputDir },
    artifacts
  };
}

module.exports = { run, meta };
