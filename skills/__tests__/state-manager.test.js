/**
 * Tests for skills/common/state-manager.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  initState, loadState, saveState, updateSkillState, updatePhaseState, getResumePoint, isSkillDone
} = require('../common/state-manager');

const TMP_STATE = path.join(__dirname, 'tmp-test-state.json');

function cleanup() {
  if (fs.existsSync(TMP_STATE)) fs.unlinkSync(TMP_STATE);
}

async function main() {
  console.log('state-manager tests...');
  cleanup();

  const pipelineDef = {
    phases: [
      { id: 'phase-0', name: 'Intake', order: 0, skills: ['skill-a', 'skill-b'] },
      { id: 'phase-1', name: 'Analysis', order: 1, skills: ['skill-c'] }
    ]
  };

  const projectConfig = { projectName: 'test-project', campaign: { name: 'Test' } };

  // Test: initState
  {
    const state = initState('run_001', projectConfig, pipelineDef);
    assert.strictEqual(state.runId, 'run_001');
    assert.strictEqual(state.projectName, 'test-project');
    assert.strictEqual(state.status, 'pending');
    assert(state.phases['phase-0']);
    assert(state.phases['phase-1']);
    assert.strictEqual(state.phases['phase-0'].skills['skill-a'].status, 'pending');
    assert.strictEqual(state.phases['phase-0'].skills['skill-b'].status, 'pending');
    assert.strictEqual(state.phases['phase-1'].skills['skill-c'].status, 'pending');
  }

  // Test: saveState + loadState
  {
    const state = initState('run_002', projectConfig, pipelineDef);
    saveState(state, TMP_STATE);
    const loaded = loadState(TMP_STATE);
    assert.strictEqual(loaded.runId, 'run_002');
    assert.strictEqual(loaded.projectName, 'test-project');
  }

  // Test: updateSkillState
  {
    const state = initState('run_003', projectConfig, pipelineDef);
    updateSkillState(state, 'phase-0', 'skill-a', { status: 'in_progress' });
    assert.strictEqual(state.phases['phase-0'].skills['skill-a'].status, 'in_progress');
    assert(state.phases['phase-0'].skills['skill-a'].startedAt);

    updateSkillState(state, 'phase-0', 'skill-a', { status: 'completed', approvalState: 'pass' });
    assert.strictEqual(state.phases['phase-0'].skills['skill-a'].status, 'completed');
    assert(state.phases['phase-0'].skills['skill-a'].completedAt);
  }

  // Test: updatePhaseState
  {
    const state = initState('run_004', projectConfig, pipelineDef);
    updatePhaseState(state, 'phase-0', { status: 'in_progress' });
    assert.strictEqual(state.phases['phase-0'].status, 'in_progress');
    assert(state.phases['phase-0'].startedAt);

    updatePhaseState(state, 'phase-0', { status: 'completed' });
    assert.strictEqual(state.phases['phase-0'].status, 'completed');
    assert(state.phases['phase-0'].completedAt);
  }

  // Test: getResumePoint
  {
    const state = initState('run_005', projectConfig, pipelineDef);
    // All pending — resume from first
    const point1 = getResumePoint(state, pipelineDef);
    assert.deepStrictEqual(point1, { phaseId: 'phase-0', skillId: 'skill-a' });

    // Mark first skill complete
    updateSkillState(state, 'phase-0', 'skill-a', { status: 'completed' });
    const point2 = getResumePoint(state, pipelineDef);
    assert.deepStrictEqual(point2, { phaseId: 'phase-0', skillId: 'skill-b' });

    // Mark all complete
    updateSkillState(state, 'phase-0', 'skill-b', { status: 'completed' });
    updateSkillState(state, 'phase-1', 'skill-c', { status: 'completed' });
    const point3 = getResumePoint(state, pipelineDef);
    assert.strictEqual(point3, null);
  }

  // Test: isSkillDone
  {
    const state = initState('run_006', projectConfig, pipelineDef);
    assert.strictEqual(isSkillDone(state, 'skill-a'), false);
    updateSkillState(state, 'phase-0', 'skill-a', { status: 'completed' });
    assert.strictEqual(isSkillDone(state, 'skill-a'), true);
    updateSkillState(state, 'phase-0', 'skill-b', { status: 'skipped' });
    assert.strictEqual(isSkillDone(state, 'skill-b'), true);
  }

  // Test: loadState returns null for missing file
  {
    const loaded = loadState('/nonexistent/path/state.json');
    assert.strictEqual(loaded, null);
  }

  cleanup();
  console.log('state-manager tests PASSED');
}

main().catch(err => {
  cleanup();
  console.error('state-manager tests FAILED:', err);
  process.exit(1);
});
