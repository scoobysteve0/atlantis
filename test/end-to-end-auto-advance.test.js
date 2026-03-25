/**
 * End-to-End Task Engine Auto-Advance Test
 * 
 * Validates that the Task Engine performs a full five-scheme owner cycle
 * end to end without manual intervention, driven by valid artifacts.
 * 
 * This test demonstrates the advance-gate.enforces strict workflow rules:
 * - Owner rotation: BUILDER -> REVIEWER -> AUDITOR -> SUPERVISOR
 * - Scheme progression: PLAN -> WORK -> VERIFY
 * - Artifacts must be registered before advancement
 */

import { test } from "node:test";
import assert from "node:assert";
import { createTaskEngine } from "../src/core/task-engine.js";
import { clearRegistry } from "../src/core/artifact-registry.js";

// Helper to create a valid artifact for registration
function createPassArtifact(owner, scheme, timestamp) {
  return {
    project_id: "atlantis-phase5",
    phase: "BUILD",
    step: "step-3",
    owner,
    scheme,
    result: "PASS",
    timestamp,
    objective: `Step 3 ${owner}/${scheme} proof`,
    summary: `Valid artifact for ${owner} ${scheme}`,
    evidence: {
      filePathsChanged: ["src/core/advance-gate.js", "src/core/task-engine.js"],
      validations: ["owner rotation enforced", "scheme progression enforced"]
    }
  };
}

test("task-engine: end-to-end full cycle auto-advance without manual intervention", () => {
  clearRegistry();
  // Create Task Engine with Step 3 configuration
  const engine = createTaskEngine({
    project_id: "atlantis-phase5",
    project_name: "Atlantis Phase 5 — Step 3 Task Engine Advance Logic",
    artifact_root: "artifacts/atlantis-phase5",
    agent_assignments: {
      BUILDER: "ollama/qwen3-next-coder:cloud",
      REVIEWER: "google/gemini-3.1-pro-preview",
      AUDITOR: "grok-4-fast-reasoning",
      SUPERVISOR: "gpt-5.3-codex"
    },
    sla_work_minutes: 45,
    failure_default: "ESCALATE",
    phases: [
      {
        key: "BUILD",
        name: "Build",
        steps: [
          {
            id: "step-3",
            name: "Task Engine advance logic",
            schemes: ["PLAN", "WORK", "VERIFY"],
            workMinutes: 45,
            acceptance: ["advance-gate.js created", "task-engine.js updated", "tests pass"]
          }
        ]
      }
    ]
  }, { rebuildRegistry: false });

  // Get initial state
  const initialState = engine.getState();
  assert.strictEqual(initialState.current.owner, "BUILDER", "Initial owner should be BUILDER");
  assert.strictEqual(initialState.current.scheme, "PLAN", "Initial scheme should be PLAN");
  assert.strictEqual(initialState.current.status, "IN_PROGRESS", "Initial status should be IN_PROGRESS");

  // Register valid artifacts and auto-advance through the full cycle
  // Cycle: BUILDER(PLAN -> WORK -> VERIFY) -> REVIEWER(PLAN -> WORK -> VERIFY) -> AUDITOR(PLAN -> WORK -> VERIFY) -> SUPERVISOR(PLAN -> WORK -> VERIFY)
  
  const ownerSequence = ["BUILDER", "REVIEWER", "AUDITOR", "SUPERVISOR"];
  const schemeSequence = ["PLAN", "WORK", "VERIFY"];
  
  const timestamps = [];
  for (let i = 0; i < 12; i++) { // 4 owners * 3 schemes = 12 artifacts
    timestamps.push(new Date(Date.now() - (12 - i) * 1000).toISOString());
  }

  // Register all 12 artifacts and advance through the cycle
  let currentOwnerIndex = 0;
  let currentSchemeIndex = 0;

  for (let i = 0; i < 12; i++) {
    const owner = ownerSequence[currentOwnerIndex];
    const scheme = schemeSequence[currentSchemeIndex];
    const timestamp = timestamps[i];

    const artifact = createPassArtifact(owner, scheme, timestamp);
    
    // Register artifact with autoSave (this triggers auto-registration)
    engine.registerArtifact(artifact, { autoSave: true });

    // Auto-advance exactly one step after registering the artifact
    try {
      engine.advanceScheme();
    } catch (e) {
      assert.fail(`Failed to auto-advance from ${engine.getState().current.owner}/${engine.getState().current.scheme}: ${e.message}`);
    }

    // Move to next scheme or next owner
    if (currentSchemeIndex < schemeSequence.length - 1) {
      currentSchemeIndex++;
    } else {
      currentOwnerIndex++;
      currentSchemeIndex = 0;
    }
  }

  // Verify final state after full cycle
  const finalState = engine.getState();

  // Step should be complete
  assert.strictEqual(finalState.current.status, "COMPLETE", "Step should be COMPLETE after full cycle");
  assert.strictEqual(finalState.current.owner, "SUPERVISOR", "Final owner should be SUPERVISOR (last owner in cycle)");
  assert.strictEqual(finalState.current.scheme, "VERIFY", "Final scheme should be VERIFY (last scheme in cycle)");

  // Verify history has all 12 advancements
  assert.strictEqual(finalState.history.length, 12, "History should have 12 advancement entries");

  // Verify events include all expected types
  const eventTypes = finalState.events.map(e => e.type);
  assert.ok(eventTypes.includes("ARTIFACT_REGISTERED"), "Should have ARTIFACT_REGISTERED events");
  assert.ok(eventTypes.includes("SCHEME_ADVANCED"), "Should have SCHEME_ADVANCED events");
  assert.ok(eventTypes.includes("OWNER_ADVANCED"), "Should have OWNER_ADVANCED events");
  assert.ok(eventTypes.includes("STEP_COMPLETE"), "Should have STEP_COMPLETE event");

  // Verify artifact count
  assert.strictEqual(finalState.artifacts.length, 12, "Should have 12 artifacts registered");

  // Verify artifact chain
  const artifacts = finalState.artifacts;
  for (let i = 0; i < artifacts.length; i++) {
    const artifact = artifacts[i];
    assert.strictEqual(artifact.owner, ownerSequence[Math.floor(i / 3)], `Artifact ${i} owner should be correct`);
    assert.strictEqual(artifact.scheme, schemeSequence[i % 3], `Artifact ${i} scheme should be correct`);
    assert.strictEqual(artifact.result, "PASS", `Artifact ${i} result should be PASS`);
  }

  // Verify history chain correctness
  const history = finalState.history;
  assert.strictEqual(history[0].owner, "BUILDER", "First history entry should be BUILDER");
  assert.strictEqual(history[0].scheme, "PLAN", "First history entry scheme should be PLAN");
  assert.strictEqual(history[11].owner, "SUPERVISOR", "Last history entry should be SUPERVISOR");
  assert.strictEqual(history[11].scheme, "VERIFY", "Last history entry scheme should be VERIFY");

  console.log("\n=== End-to-End Cycle Test PASSED ===");
  console.log("Full cycle completed: 4 owners * 3 schemes = 12 artifacts");
  console.log("Final state:", finalState.current.owner + "/" + finalState.current.scheme);
  console.log("Total events:", finalState.events.length);
  console.log("Total history entries:", finalState.history.length);
  console.log("=====================================\n");
});

test("task-engine: advance-gate enforces owner rotation", () => {
  clearRegistry();
  const engine = createTaskEngine({
    project_id: "atlantis-phase5",
    project_name: "Test",
    artifact_root: "artifacts/atlantis-phase5",
    agent_assignments: {
      BUILDER: "ollama/qwen3-next-coder:cloud",
      REVIEWER: "google/gemini-3.1-pro-preview",
      AUDITOR: "grok-4-fast-reasoning",
      SUPERVISOR: "gpt-5.3-codex"
    },
    sla_work_minutes: 45,
    failure_default: "ESCALATE",
    phases: [{
      key: "BUILD",
      name: "Build",
      steps: [{
        id: "step-3",
        name: "Test",
        schemes: ["PLAN", "WORK", "VERIFY"],
        workMinutes: 45,
        acceptance: ["tests pass"]
      }]
    }]
  }, { rebuildRegistry: false });

  // Register BUILDER/PLAN
  engine.registerArtifact(createPassArtifact("BUILDER", "PLAN", "2026-03-22T10:00:00-05:00"), { autoSave: true });
  engine.advanceScheme(); // BUILDER/PLAN -> BUILDER/WORK

  // Register BUILDER/WORK  
  engine.registerArtifact(createPassArtifact("BUILDER", "WORK", "2026-03-22T10:01:00-05:00"), { autoSave: true });
  engine.advanceScheme(); // BUILDER/WORK -> BUILDER/VERIFY

  // Register BUILDER/VERIFY
  engine.registerArtifact(createPassArtifact("BUILDER", "VERIFY", "2026-03-22T10:02:00-05:00"), { autoSave: true });
  engine.advanceScheme(); // BUILDER/VERIFY -> REVIEWER/PLAN

  const state = engine.getState();
  assert.strictEqual(state.current.owner, "REVIEWER");
  assert.strictEqual(state.current.scheme, "PLAN");
});

test("task-engine: advance-gate enforces scheme progression", () => {
  clearRegistry();
  const engine = createTaskEngine({
    project_id: "atlantis-phase5",
    project_name: "Test",
    artifact_root: "artifacts/atlantis-phase5",
    agent_assignments: {
      BUILDER: "ollama/qwen3-next-coder:cloud",
      REVIEWER: "google/gemini-3.1-pro-preview",
      AUDITOR: "grok-4-fast-reasoning",
      SUPERVISOR: "gpt-5.3-codex"
    },
    sla_work_minutes: 45,
    failure_default: "ESCALATE",
    phases: [{
      key: "BUILD",
      name: "Build",
      steps: [{
        id: "step-3",
        name: "Test",
        schemes: ["PLAN", "WORK", "VERIFY"],
        workMinutes: 45,
        acceptance: ["tests pass"]
      }]
    }]
  }, { rebuildRegistry: false });

  // Register BUILDER/PLAN
  engine.registerArtifact(createPassArtifact("BUILDER", "PLAN", "2026-03-22T10:00:00-05:00"), { autoSave: true });

  // Should advance to WORK
  engine.advanceScheme();
  assert.strictEqual(engine.getState().current.scheme, "WORK");

  // Register BUILDER/WORK
  engine.registerArtifact(createPassArtifact("BUILDER", "WORK", "2026-03-22T10:01:00-05:00"), { autoSave: true });

  // Should advance to VERIFY
  engine.advanceScheme();
  assert.strictEqual(engine.getState().current.scheme, "VERIFY");
});

test("task-engine: advance-gate fails without artifact", () => {
  clearRegistry();
  const engine = createTaskEngine({
    project_id: "atlantis-phase5",
    project_name: "Test",
    artifact_root: "artifacts/atlantis-phase5",
    agent_assignments: {
      BUILDER: "ollama/qwen3-next-coder:cloud",
      REVIEWER: "google/gemini-3.1-pro-preview",
      AUDITOR: "grok-4-fast-reasoning",
      SUPERVISOR: "gpt-5.3-codex"
    },
    sla_work_minutes: 45,
    failure_default: "ESCALATE",
    phases: [{
      key: "BUILD",
      name: "Build",
      steps: [{
        id: "step-3",
        name: "Test",
        schemes: ["PLAN", "WORK", "VERIFY"],
        workMinutes: 45,
        acceptance: ["tests pass"]
      }]
    }]
  }, { rebuildRegistry: false });

  // Register BUILDER/PLAN
  engine.registerArtifact(createPassArtifact("BUILDER", "PLAN", "2026-03-22T10:00:00-05:00"), { autoSave: true });

  // Should advance to WORK
  engine.advanceScheme();

  // Should fail without WORK artifact
  try {
    engine.advanceScheme();
    assert.fail("Should have thrown error");
  } catch (e) {
    assert.ok(e.message.includes("Missing PASS artifact"), "Should fail with missing artifact error");
  }
});
