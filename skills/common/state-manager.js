/**
 * State manager: read/write/update state/project-state.json for skill pipeline resume and tracking.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');
const DEFAULT_STATE_DIR = path.join(REPO_ROOT, 'state');

/**
 * Initialise a new project state.
 * @param {string} runId
 * @param {Object} projectConfig - from --project input JSON
 * @param {Object} pipelineDef - from config/skills-pipeline.json
 * @returns {Object} state
 */
function initState(runId, projectConfig, pipelineDef) {
  const now = new Date().toISOString();
  const phases = {};
  for (const phase of pipelineDef.phases) {
    const skills = {};
    for (const skillId of phase.skills) {
      skills[skillId] = {
        status: 'pending',
        approvalState: null,
        startedAt: null,
        completedAt: null,
        reasoningLog: [],
        errors: [],
        artifacts: {}
      };
    }
    phases[phase.id] = {
      status: 'pending',
      startedAt: null,
      completedAt: null,
      skills
    };
  }
  return {
    runId,
    projectName: projectConfig.projectName || 'unnamed',
    campaignId: projectConfig.campaign ? projectConfig.campaign.name : null,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    projectConfig,
    phases,
    gateResults: {}
  };
}

/**
 * Load existing state from file.
 * @param {string} [statePath]
 * @returns {Object|null}
 */
function loadState(statePath) {
  const p = statePath || path.join(DEFAULT_STATE_DIR, 'project-state.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

/**
 * Save state to file (atomic write via temp file).
 * @param {Object} state
 * @param {string} [statePath]
 */
function saveState(state, statePath) {
  const p = statePath || path.join(DEFAULT_STATE_DIR, 'project-state.json');
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  state.updatedAt = new Date().toISOString();
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8');
  fs.renameSync(tmp, p);
}

/**
 * Update a skill's state within a phase.
 * @param {Object} state
 * @param {string} phaseId
 * @param {string} skillId
 * @param {Object} patch - { status?, approvalState?, reasoningLog?, errors?, artifacts? }
 */
function updateSkillState(state, phaseId, skillId, patch) {
  const phase = state.phases[phaseId];
  if (!phase) return;
  const skill = phase.skills[skillId];
  if (!skill) return;
  if (patch.status === 'in_progress' && !skill.startedAt) {
    skill.startedAt = new Date().toISOString();
  }
  if (patch.status === 'completed' || patch.status === 'failed' || patch.status === 'skipped') {
    skill.completedAt = new Date().toISOString();
  }
  Object.assign(skill, patch);
}

/**
 * Update a phase's status.
 * @param {Object} state
 * @param {string} phaseId
 * @param {Object} patch - { status?, startedAt?, completedAt? }
 */
function updatePhaseState(state, phaseId, patch) {
  const phase = state.phases[phaseId];
  if (!phase) return;
  if (patch.status === 'in_progress' && !phase.startedAt) {
    phase.startedAt = new Date().toISOString();
  }
  if (patch.status === 'completed' || patch.status === 'failed') {
    phase.completedAt = new Date().toISOString();
  }
  Object.assign(phase, patch);
}

/**
 * Find the resume point: first skill that is not completed/skipped.
 * Returns { phaseId, skillId } or null if all done.
 * @param {Object} state
 * @param {Object} pipelineDef
 * @returns {{ phaseId: string, skillId: string } | null}
 */
function getResumePoint(state, pipelineDef) {
  const sortedPhases = [...pipelineDef.phases].sort((a, b) => a.order - b.order);
  for (const phase of sortedPhases) {
    const phaseState = state.phases[phase.id];
    if (!phaseState) continue;
    for (const skillId of phase.skills) {
      const skillState = phaseState.skills[skillId];
      if (!skillState) continue;
      if (skillState.status !== 'completed' && skillState.status !== 'skipped') {
        return { phaseId: phase.id, skillId };
      }
    }
  }
  return null;
}

/**
 * Check if a skill is completed or skipped.
 * @param {Object} state
 * @param {string} skillId
 * @returns {boolean}
 */
function isSkillDone(state, skillId) {
  for (const phase of Object.values(state.phases)) {
    const skill = phase.skills[skillId];
    if (skill) {
      return skill.status === 'completed' || skill.status === 'skipped';
    }
  }
  return false;
}

module.exports = {
  initState,
  loadState,
  saveState,
  updateSkillState,
  updatePhaseState,
  getResumePoint,
  isSkillDone,
  DEFAULT_STATE_DIR
};
