#!/usr/bin/env node
/**
 * Skills Pipeline CLI: orchestrates templatisation skills in phase order.
 *
 * Usage:
 *   node run_skills_pipeline.js --project <path-to-project.json> [--dry-run] [--resume] [--validate-only]
 *
 * Stories: SYS1-4, V1-2, S1-2
 */

const fs = require('fs');
const path = require('path');

const { runSkill, loadSkillMeta } = require('../skills/common/skill-contract');
const { initState, loadState, saveState, updateSkillState, updatePhaseState, getResumePoint, isSkillDone } = require('../skills/common/state-manager');
const { evaluateGates } = require('../skills/common/gate-evaluator');
const { appendAuditEntry, generateRunId } = require('./agents/common/audit');

const REPO_ROOT = path.resolve(__dirname, '..');
const PIPELINE_CONFIG_PATH = path.join(REPO_ROOT, 'config', 'skills-pipeline.json');
const STATE_PATH = path.join(REPO_ROOT, 'state', 'project-state.json');

// --- CLI Argument Parsing ---
function parseArgs(argv) {
  const args = { project: null, dryRun: false, resume: false, validateOnly: false };
  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case '--project':
        args.project = argv[++i];
        break;
      case '--dry-run':
        args.dryRun = true;
        break;
      case '--resume':
        args.resume = true;
        break;
      case '--validate-only':
        args.validateOnly = true;
        break;
    }
  }
  return args;
}

// --- Dependency Validation (V2) ---
function validateDependencies(pipelineDef) {
  const allSkillIds = new Set();
  for (const phase of pipelineDef.phases) {
    for (const skillId of phase.skills) allSkillIds.add(skillId);
  }

  const errors = [];
  const visited = new Set();
  const inStack = new Set();

  function detectCycle(skillId, stack) {
    if (inStack.has(skillId)) {
      errors.push(`Circular dependency detected: ${[...stack, skillId].join(' -> ')}`);
      return;
    }
    if (visited.has(skillId)) return;
    visited.add(skillId);
    inStack.add(skillId);

    const meta = loadSkillMeta(skillId);
    if (!meta) {
      errors.push(`Skill module not found: ${skillId}`);
      inStack.delete(skillId);
      return;
    }
    for (const dep of (meta.dependsOn || [])) {
      if (!allSkillIds.has(dep)) {
        errors.push(`Skill "${skillId}" depends on "${dep}" which is not in the pipeline`);
      } else {
        detectCycle(dep, [...stack, skillId]);
      }
    }
    inStack.delete(skillId);
  }

  for (const skillId of allSkillIds) {
    detectCycle(skillId, []);
  }

  return errors;
}

// --- Dry Run (V1) ---
function dryRun(pipelineDef, projectConfig) {
  console.log('\n=== DRY RUN ===\n');

  const depErrors = validateDependencies(pipelineDef);
  if (depErrors.length > 0) {
    console.log('Dependency validation FAILED:');
    depErrors.forEach(e => console.log(`  - ${e}`));
    process.exit(1);
  }
  console.log('Dependency validation: PASS\n');

  const sortedPhases = [...pipelineDef.phases].sort((a, b) => a.order - b.order);
  for (const phase of sortedPhases) {
    console.log(`Phase ${phase.order}: ${phase.name} (${phase.id})`);
    for (const skillId of phase.skills) {
      const meta = loadSkillMeta(skillId);
      if (!meta) {
        console.log(`  [?] ${skillId} — module not found`);
        continue;
      }
      const gateResult = evaluateGates(meta.gates, projectConfig);
      const gateStatus = meta.gates.length === 0 ? 'always' : (gateResult.pass ? 'PASS' : 'SKIP');
      console.log(`  [${gateStatus}] ${skillId} — ${meta.description || meta.name}`);
      if (!gateResult.pass && gateResult.results.length > 0) {
        for (const r of gateResult.results) {
          console.log(`         gate: ${r.field} ${r.operator} ${JSON.stringify(r.expected)} — actual: ${JSON.stringify(r.actual)} — ${r.pass ? 'pass' : 'fail'}`);
        }
      }
      if (meta.dependsOn.length > 0) {
        console.log(`         depends on: ${meta.dependsOn.join(', ')}`);
      }
    }
    console.log();
  }
  console.log('=== DRY RUN COMPLETE ===');
}

// --- Main Execution ---
async function main() {
  const args = parseArgs(process.argv);

  if (!args.project && !args.validateOnly) {
    console.error('Usage: node run_skills_pipeline.js --project <path.json> [--dry-run] [--resume] [--validate-only]');
    process.exit(1);
  }

  // Load pipeline definition
  if (!fs.existsSync(PIPELINE_CONFIG_PATH)) {
    console.error(`Pipeline config not found: ${PIPELINE_CONFIG_PATH}`);
    process.exit(1);
  }
  const pipelineDef = JSON.parse(fs.readFileSync(PIPELINE_CONFIG_PATH, 'utf8'));

  // Validate-only mode
  if (args.validateOnly) {
    const depErrors = validateDependencies(pipelineDef);
    if (depErrors.length > 0) {
      console.log('Dependency validation FAILED:');
      depErrors.forEach(e => console.log(`  - ${e}`));
      process.exit(1);
    }
    console.log('Dependency validation: PASS');
    process.exit(0);
  }

  // Load project config
  const projectPath = path.isAbsolute(args.project) ? args.project : path.resolve(process.cwd(), args.project);
  if (!fs.existsSync(projectPath)) {
    console.error(`Project file not found: ${projectPath}`);
    process.exit(1);
  }
  const projectConfig = JSON.parse(fs.readFileSync(projectPath, 'utf8'));

  // Dry-run mode
  if (args.dryRun) {
    dryRun(pipelineDef, projectConfig);
    process.exit(0);
  }

  // Init or resume state
  let state;
  const runId = generateRunId();
  if (args.resume) {
    state = loadState(STATE_PATH);
    if (!state) {
      console.error('No state file found to resume. Run without --resume first.');
      process.exit(1);
    }
    console.log(`Resuming run: ${state.runId}`);
  } else {
    state = initState(runId, projectConfig, pipelineDef);
    state.status = 'in_progress';
    saveState(state, STATE_PATH);
    console.log(`Starting run: ${runId}`);
  }

  // Execute phases in order
  const sortedPhases = [...pipelineDef.phases].sort((a, b) => a.order - b.order);
  let pipelineSuccess = true;

  for (const phase of sortedPhases) {
    // For resume: skip completed phases
    const phaseState = state.phases[phase.id];
    if (phaseState && phaseState.status === 'completed') {
      console.log(`  [skip] Phase: ${phase.name} (already completed)`);
      continue;
    }

    console.log(`\n--- Phase ${phase.order}: ${phase.name} ---`);
    updatePhaseState(state, phase.id, { status: 'in_progress' });
    saveState(state, STATE_PATH);

    if (phase.parallel) {
      // Run conditional skills in parallel
      const results = await Promise.all(phase.skills.map(skillId => runSingleSkill(skillId, state, phase, projectConfig, pipelineDef)));
      if (results.some(r => !r)) pipelineSuccess = false;
    } else {
      // Run skills sequentially
      for (const skillId of phase.skills) {
        const ok = await runSingleSkill(skillId, state, phase, projectConfig, pipelineDef);
        if (!ok) {
          pipelineSuccess = false;
          break;
        }
      }
    }

    // Check if all skills in phase are done
    const allDone = phase.skills.every(sid => {
      const s = phaseState && phaseState.skills[sid];
      return s && (s.status === 'completed' || s.status === 'skipped');
    });
    updatePhaseState(state, phase.id, { status: allDone ? 'completed' : 'failed' });
    saveState(state, STATE_PATH);

    if (!pipelineSuccess && phase.sequential) break;
  }

  state.status = pipelineSuccess ? 'completed' : 'failed';
  saveState(state, STATE_PATH);
  console.log(`\n=== Pipeline ${state.status.toUpperCase()} (${state.runId}) ===`);
  process.exit(pipelineSuccess ? 0 : 1);
}

/**
 * Run a single skill: gate evaluation, execution, state update, audit logging.
 * @returns {Promise<boolean>} true if skill succeeded or was skipped
 */
async function runSingleSkill(skillId, state, phase, projectConfig, pipelineDef) {
  const phaseState = state.phases[phase.id];
  const skillState = phaseState && phaseState.skills[skillId];

  // Skip if already completed
  if (skillState && (skillState.status === 'completed' || skillState.status === 'skipped')) {
    console.log(`  [skip] ${skillId} (already ${skillState.status})`);
    return true;
  }

  const meta = loadSkillMeta(skillId);
  if (!meta) {
    console.log(`  [FAIL] ${skillId} — module not found`);
    updateSkillState(state, phase.id, skillId, { status: 'failed', errors: ['Module not found'] });
    saveState(state, STATE_PATH);
    return false;
  }

  // Check dependencies
  for (const dep of (meta.dependsOn || [])) {
    if (!isSkillDone(state, dep)) {
      console.log(`  [WAIT] ${skillId} — dependency "${dep}" not complete`);
      updateSkillState(state, phase.id, skillId, { status: 'failed', errors: [`Dependency not met: ${dep}`] });
      saveState(state, STATE_PATH);
      return false;
    }
  }

  // Evaluate gates
  const gateResult = evaluateGates(meta.gates, projectConfig);
  state.gateResults[skillId] = gateResult.pass;
  if (!gateResult.pass) {
    console.log(`  [GATE] ${skillId} — skipped (gate conditions not met)`);
    updateSkillState(state, phase.id, skillId, { status: 'skipped', approvalState: 'skipped' });
    saveState(state, STATE_PATH);
    return true;
  }

  // Execute
  console.log(`  [RUN]  ${skillId}...`);
  updateSkillState(state, phase.id, skillId, { status: 'in_progress' });
  saveState(state, STATE_PATH);

  // Build accumulated payload from previous skill outputs
  const accumulatedPayload = buildPayload(state, projectConfig);
  const outputDir = path.join(REPO_ROOT, 'output', 'skills', skillId.replace('templatisation-', ''));
  const result = await runSkill(skillId, {
    payload: accumulatedPayload,
    context: { runId: state.runId, outputDir }
  });

  // Update state
  updateSkillState(state, phase.id, skillId, {
    status: result.success ? 'completed' : 'failed',
    approvalState: result.approvalState,
    reasoningLog: result.reasoningLog,
    errors: result.errors,
    artifacts: result.artifacts
  });

  // Merge outputPayload into state for downstream skills
  if (result.outputPayload) {
    if (!state._outputPayloads) state._outputPayloads = {};
    state._outputPayloads[skillId] = result.outputPayload;
  }

  saveState(state, STATE_PATH);

  // Audit entry
  appendAuditEntry({
    runId: state.runId,
    agentId: skillId,
    version: '1.0.0',
    approvalState: result.approvalState,
    reasoningLog: result.reasoningLog
  });

  const icon = result.success ? 'PASS' : 'FAIL';
  console.log(`  [${icon}] ${skillId} — ${result.approvalState} (${result.reasoningLog.length} log entries, ${Object.keys(result.artifacts).length} artifacts)`);

  return result.success;
}

/**
 * Build accumulated payload from all completed skill outputs + projectConfig.
 */
function buildPayload(state, projectConfig) {
  const payload = { projectConfig };
  const outputs = state._outputPayloads || {};
  for (const [, output] of Object.entries(outputs)) {
    Object.assign(payload, output);
  }
  return payload;
}

main().catch(err => {
  console.error('Pipeline error:', err);
  process.exit(1);
});
