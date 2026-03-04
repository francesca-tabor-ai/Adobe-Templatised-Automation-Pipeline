/**
 * Integration test for the skills pipeline.
 * Runs the full pipeline programmatically with the sample project input.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { runSkill, loadSkillMeta } = require('../common/skill-contract');
const { initState, saveState, updateSkillState, updatePhaseState, isSkillDone, getResumePoint } = require('../common/state-manager');
const { evaluateGates } = require('../common/gate-evaluator');
const { generateRunId } = require('../../orchestrator/agents/common/audit');

const REPO_ROOT = path.resolve(__dirname, '../..');
const PIPELINE_CONFIG_PATH = path.join(REPO_ROOT, 'config', 'skills-pipeline.json');
const SAMPLE_PROJECT = path.join(REPO_ROOT, 'data', 'sample', 'project-input.json');
const TEST_STATE_PATH = path.join(__dirname, 'tmp-pipeline-state.json');
const TEST_OUTPUT_BASE = path.join(__dirname, 'tmp-pipeline-output');

function cleanup() {
  if (fs.existsSync(TEST_STATE_PATH)) fs.unlinkSync(TEST_STATE_PATH);
  if (fs.existsSync(TEST_OUTPUT_BASE)) {
    fs.rmSync(TEST_OUTPUT_BASE, { recursive: true, force: true });
  }
}

async function main() {
  console.log('pipeline integration tests...');
  cleanup();

  const pipelineDef = JSON.parse(fs.readFileSync(PIPELINE_CONFIG_PATH, 'utf8'));
  const projectConfig = JSON.parse(fs.readFileSync(SAMPLE_PROJECT, 'utf8'));

  // Test: all skill meta loads correctly
  {
    const allSkillIds = pipelineDef.phases.flatMap(p => p.skills);
    for (const id of allSkillIds) {
      const meta = loadSkillMeta(id);
      assert(meta, `Skill meta missing for: ${id}`);
      assert(meta.id, `Skill meta.id missing for: ${id}`);
      assert(typeof meta.phase === 'number', `Skill meta.phase not a number for: ${id}`);
      assert(Array.isArray(meta.dependsOn), `Skill meta.dependsOn not array for: ${id}`);
      assert(Array.isArray(meta.gates), `Skill meta.gates not array for: ${id}`);
    }
    console.log('  all skill metas load: PASS');
  }

  // Test: dependency graph is valid (no cycles, all deps exist)
  {
    const allSkillIds = new Set(pipelineDef.phases.flatMap(p => p.skills));
    for (const id of allSkillIds) {
      const meta = loadSkillMeta(id);
      for (const dep of meta.dependsOn) {
        assert(allSkillIds.has(dep), `Skill "${id}" depends on "${dep}" which is not in pipeline`);
      }
    }
    console.log('  dependency graph valid: PASS');
  }

  // Test: gate evaluation with sample project
  {
    // Sample project has hasIridescentEffects=true, skuCount=3
    const iridescentMeta = loadSkillMeta('templatisation-iridescent');
    const multiskuMeta = loadSkillMeta('templatisation-multisku');
    assert.strictEqual(evaluateGates(iridescentMeta.gates, projectConfig).pass, true);
    assert.strictEqual(evaluateGates(multiskuMeta.gates, projectConfig).pass, true);
    console.log('  gate evaluation with sample: PASS');
  }

  // Test: run full pipeline sequentially
  {
    const runId = generateRunId();
    const state = initState(runId, projectConfig, pipelineDef);
    state.status = 'in_progress';

    const sortedPhases = [...pipelineDef.phases].sort((a, b) => a.order - b.order);
    const accumulatedPayload = { projectConfig };

    for (const phase of sortedPhases) {
      updatePhaseState(state, phase.id, { status: 'in_progress' });

      const skillsToRun = [];
      for (const skillId of phase.skills) {
        const meta = loadSkillMeta(skillId);
        const gateResult = evaluateGates(meta.gates, projectConfig);
        state.gateResults = state.gateResults || {};
        state.gateResults[skillId] = gateResult.pass;

        if (!gateResult.pass) {
          updateSkillState(state, phase.id, skillId, { status: 'skipped', approvalState: 'skipped' });
          continue;
        }
        skillsToRun.push(skillId);
      }

      const runFn = async (skillId) => {
        updateSkillState(state, phase.id, skillId, { status: 'in_progress' });
        const outputDir = path.join(TEST_OUTPUT_BASE, skillId.replace('templatisation-', ''));
        const result = await runSkill(skillId, {
          payload: { ...accumulatedPayload },
          context: { runId, outputDir }
        });
        updateSkillState(state, phase.id, skillId, {
          status: result.success ? 'completed' : 'failed',
          approvalState: result.approvalState,
          reasoningLog: result.reasoningLog,
          errors: result.errors,
          artifacts: result.artifacts
        });
        if (result.outputPayload) {
          Object.assign(accumulatedPayload, result.outputPayload);
        }
        return result;
      };

      if (phase.parallel) {
        const results = await Promise.all(skillsToRun.map(runFn));
        assert(results.every(r => r.success), `Parallel phase "${phase.id}" had failures`);
      } else {
        for (const skillId of skillsToRun) {
          const result = await runFn(skillId);
          assert(result.success, `Skill "${skillId}" failed: ${result.errors.join(', ')}`);
        }
      }

      updatePhaseState(state, phase.id, { status: 'completed' });
    }

    state.status = 'completed';
    saveState(state, TEST_STATE_PATH);

    // Verify state
    const savedState = JSON.parse(fs.readFileSync(TEST_STATE_PATH, 'utf8'));
    assert.strictEqual(savedState.status, 'completed');

    // All skills should be completed or skipped
    for (const phase of pipelineDef.phases) {
      for (const skillId of phase.skills) {
        const s = savedState.phases[phase.id].skills[skillId];
        assert(s.status === 'completed' || s.status === 'skipped', `Skill ${skillId} status is ${s.status}`);
      }
    }

    // Both conditional skills should be completed (sample has iridescent=true, skuCount=3)
    assert.strictEqual(savedState.gateResults['templatisation-iridescent'], true);
    assert.strictEqual(savedState.gateResults['templatisation-multisku'], true);

    console.log('  full pipeline run: PASS');
  }

  // Test: resume from mid-point
  {
    const state = initState('run_resume_test', projectConfig, pipelineDef);
    // Mark first two skills as complete
    updateSkillState(state, 'phase-0-intake', 'templatisation-comms', { status: 'completed' });
    updateSkillState(state, 'phase-0-intake', 'templatisation-workspace', { status: 'completed' });

    const resumePoint = getResumePoint(state, pipelineDef);
    assert(resumePoint, 'Should have a resume point');
    assert.strictEqual(resumePoint.phaseId, 'phase-1-analysis');
    assert.strictEqual(resumePoint.skillId, 'templatisation-analysis');
    console.log('  resume point detection: PASS');
  }

  cleanup();
  console.log('pipeline integration tests PASSED');
}

main().catch(err => {
  cleanup();
  console.error('pipeline integration tests FAILED:', err);
  process.exit(1);
});
