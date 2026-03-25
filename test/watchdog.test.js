import { test } from "node:test";
import assert from "node:assert";
import { createTaskEngine } from "../src/core/task-engine.js";
import { clearRegistry } from "../src/core/artifact-registry.js";

// Helper to create a valid project definition
function createTestEngineConfig(overrides = {}) {
  return {
    project_id: "atlantis-phase5",
    project_name: "Test",
    artifact_root: "artifacts/atlantis-phase5",
    agent_assignments: {
      BUILDER: "ollama/qwen3-next-coder:cloud",
      REVIEWER: "google/gemini-3.1-pro-preview",
      AUDITOR: "grok-4-fast-reasoning",
      SUPERVISOR: "gpt-5.3-codex"
    },
    sla_work_minutes: 15,
    failure_default: "ESCALATE",
    phases: [{
      key: "BUILD",
      name: "Build",
      steps: [{
        id: "step-1",
        name: "Test",
        schemes: ["PLAN", "WORK", "VERIFY"],
        workMinutes: 45,
        acceptance: ["tests pass"]
      }]
    }],
    ...overrides
  };
}

// Helper to create a valid artifact for registration
function createPassArtifact(owner, scheme, timestamp) {
  return {
    project_id: "atlantis-phase5",
    phase: "BUILD",
    step: "step-1",
    owner,
    scheme,
    result: "PASS",
    timestamp,
    objective: "Test artifact",
    summary: "Valid artifact for test",
    evidence: {
      filePathsChanged: ["test.js"],
      validations: ["test passed"]
    }
  };
}

test("watchdog: heartbeat initializes with defaults", () => {
  clearRegistry();
  const engine = createTaskEngine(createTestEngineConfig(), { rebuildRegistry: false });

  const state = engine.getState();
  
  assert.strictEqual(state.heartbeat.status, "ACTIVE", "Heartbeat should initialize as ACTIVE");
  assert.strictEqual(state.heartbeat.strike, 0, "Strike should initialize at 0");
  assert.ok(state.heartbeat.lastAt, "lastAt should be set");
});

test("watchdog: checkHeartbeat returns ACTIVE when within SLA", () => {
  clearRegistry();
  const engine = createTaskEngine(createTestEngineConfig({ sla_work_minutes: 15 }), { rebuildRegistry: false });

  // Check immediately after initialization (within SLA)
  const result = engine.checkHeartbeat();
  
  assert.strictEqual(result.status, "ACTIVE", "Status should be ACTIVE");
  assert.strictEqual(result.strike, 0, "Strike should be 0");
  assert.ok(result.elapsedMs >= 0, "elapsedMs should be non-negative");
  assert.ok(result.elapsedMs < 15 * 60000, "elapsedMs should be less than SLA");
});

test("watchdog: checkHeartbeat detects STALLED when SLA exceeded", () => {
  clearRegistry();
  const engine = createTaskEngine(createTestEngineConfig({
    sla_work_minutes: 1,
    escalation_minutes: 2,
    hard_stop_minutes: 3
  }), { rebuildRegistry: false });

  // Manually set lastAt to 2 minutes ago (exceeds SLA but not escalation)
  const twoMinutesAgo = new Date(Date.now() - 2 * 60000).toISOString();
  engine.getState().heartbeat.lastAt = twoMinutesAgo;

  const result = engine.checkHeartbeat();
  
  assert.strictEqual(result.status, "STALLED", "Status should be STALLED");
  assert.strictEqual(result.strike, 1, "Strike should be 1");
  assert.ok(result.failureRouting, "Failure routing should be present");
  assert.strictEqual(result.failureRouting.type, "RETRY", "Failure type should be RETRY");
});

test("watchdog: checkHeartbeat detects ESCALATED when escalation threshold exceeded", () => {
  clearRegistry();
  const engine = createTaskEngine(createTestEngineConfig({"sla_work_minutes":1,"escalation_minutes":2,"hard_stop_minutes":3}));

  // Manually set lastAt to 2.5 minutes ago (exceeds escalation but not hard stop)
  const twoAndAHalfMinutesAgo = new Date(Date.now() - 2.5 * 60000).toISOString();
  engine.getState().heartbeat.lastAt = twoAndAHalfMinutesAgo;

  const result = engine.checkHeartbeat();
  
  assert.strictEqual(result.status, "ESCALATED", "Status should be ESCALATED");
  assert.strictEqual(result.strike, 2, "Strike should be 2");
  assert.ok(result.failureRouting, "Failure routing should be present");
  assert.strictEqual(result.failureRouting.type, "ESCALATE", "Failure type should be ESCALATE");
});

test("watchdog: checkHeartbeat detects HARD_STOP when hard stop threshold exceeded", () => {
  clearRegistry();
  const engine = createTaskEngine(createTestEngineConfig({"sla_work_minutes":1,"escalation_minutes":2,"hard_stop_minutes":3}));

  // Manually set lastAt to 4 minutes ago (exceeds hard stop)
  const fourMinutesAgo = new Date(Date.now() - 4 * 60000).toISOString();
  engine.getState().heartbeat.lastAt = fourMinutesAgo;

  const result = engine.checkHeartbeat();
  
  assert.strictEqual(result.status, "HARD_STOP", "Status should be HARD_STOP");
  assert.strictEqual(result.strike, 3, "Strike should be 3 (MAX_STRIKES)");
  assert.ok(result.failureRouting, "Failure routing should be present");
  assert.strictEqual(result.failureRouting.type, "DEFER", "Failure type should be DEFER");
});

test("watchdog: registerArtifact resets heartbeat", () => {
  clearRegistry();
  const engine = createTaskEngine(createTestEngineConfig({"sla_work_minutes":1}));

  // Set lastAt to 2 minutes ago (should trigger STALLED)
  const twoMinutesAgo = new Date(Date.now() - 2 * 60000).toISOString();
  engine.getState().heartbeat.lastAt = twoMinutesAgo;
  
  let result = engine.checkHeartbeat();
  assert.strictEqual(result.status, "STALLED", "Should be STALLED before artifact registration");

  // Register artifact (should reset heartbeat)
  const artifact = createPassArtifact("BUILDER", "PLAN", new Date().toISOString());
  engine.registerArtifact(artifact, { autoSave: false });

  // Check heartbeat again (should be reset)
  result = engine.checkHeartbeat();
  assert.strictEqual(result.status, "ACTIVE", "Status should be ACTIVE after artifact registration");
  assert.strictEqual(result.strike, 0, "Strike should be 0 after artifact registration");
});

test("watchdog: advanceScheme fails when heartbeat is STALLED", () => {
  clearRegistry();
  const engine = createTaskEngine(createTestEngineConfig({"sla_work_minutes":1}));

  // Register PLAN artifact
  engine.registerArtifact(createPassArtifact("BUILDER", "PLAN", "2026-03-23T00:00:00-05:00"), { autoSave: false });

  // Simulate stalled heartbeat (2 minutes since last heartbeat)
  const twoMinutesAgo = new Date(Date.now() - 2 * 60000).toISOString();
  engine.getState().heartbeat.lastAt = twoMinutesAgo;

  const result = engine.advanceScheme();
  
  assert.ok(!result.ok, "advanceScheme should fail when heartbeat is STALLED");
  assert.strictEqual(result.failure.type, "RETRY", "Failure type should be RETRY");
  assert.ok(result.reason.includes("Heartbeat"), "Reason should mention heartbeat");
});

test("watchdog: advanceScheme fails when heartbeat is ESCALATED", () => {
  clearRegistry();
  const engine = createTaskEngine(createTestEngineConfig({"sla_work_minutes":1,"escalation_minutes":2,"hard_stop_minutes":3}));

  // Register PLAN artifact
  engine.registerArtifact(createPassArtifact("BUILDER", "PLAN", "2026-03-23T00:00:00-05:00"), { autoSave: false });

  // Simulate escalated heartbeat (2.5 minutes since last heartbeat)
  const twoAndAHalfMinutesAgo = new Date(Date.now() - 2.5 * 60000).toISOString();
  engine.getState().heartbeat.lastAt = twoAndAHalfMinutesAgo;

  const result = engine.advanceScheme();
  
  assert.ok(!result.ok, "advanceScheme should fail when heartbeat is ESCALATED");
  assert.strictEqual(result.failure.type, "ESCALATE", "Failure type should be ESCALATE");
});

test("watchdog: advanceScheme fails when heartbeat is HARD_STOP", () => {
  clearRegistry();
  const engine = createTaskEngine(createTestEngineConfig({"sla_work_minutes":1,"escalation_minutes":2,"hard_stop_minutes":3}));

  // Register PLAN artifact
  engine.registerArtifact(createPassArtifact("BUILDER", "PLAN", "2026-03-23T00:00:00-05:00"), { autoSave: false });

  // Simulate hard stop heartbeat (4 minutes since last heartbeat)
  const fourMinutesAgo = new Date(Date.now() - 4 * 60000).toISOString();
  engine.getState().heartbeat.lastAt = fourMinutesAgo;

  const result = engine.advanceScheme();
  
  assert.ok(!result.ok, "advanceScheme should fail when heartbeat is HARD_STOP");
  assert.strictEqual(result.failure.type, "DEFER", "Failure type should be DEFER");
});

test("watchdog: advanceScheme succeeds when heartbeat is ACTIVE", () => {
  clearRegistry();
  const engine = createTaskEngine(createTestEngineConfig());

  // Register PLAN artifact
  engine.registerArtifact(createPassArtifact("BUILDER", "PLAN", "2026-03-23T00:00:00-05:00"), { autoSave: false });

  // advanceScheme should succeed (heartbeat is ACTIVE)
  const result = engine.advanceScheme();
  
  assert.ok(result.ok !== false, "advanceScheme should succeed when heartbeat is ACTIVE");
  assert.strictEqual(result.current?.scheme, "WORK", "Should advance to WORK scheme");
});

test("watchdog: getState includes heartbeat state", () => {
  clearRegistry();
  const engine = createTaskEngine(createTestEngineConfig());

  const state = engine.getState();
  
  assert.ok(state.heartbeat, "State should include heartbeat");
  assert.ok(state.heartbeat.status, "Heartbeat should have status");
  assert.ok(state.heartbeat.strike !== undefined, "Heartbeat should have strike");
  assert.ok(state.heartbeat.lastAt, "Heartbeat should have lastAt");
  assert.strictEqual(state.heartbeat.slaMinutes, 15, "SLA minutes should be set from config");
});

test("watchdog: heartbeat advances strike on consecutive missed heartbeats", () => {
  clearRegistry();
  const engine = createTaskEngine(createTestEngineConfig({"sla_work_minutes":1,"escalation_minutes":2,"hard_stop_minutes":3}));

  // Initial state - ACTIVE
  let result = engine.checkHeartbeat();
  assert.strictEqual(result.strike, 0, "Initial strike should be 0");

  // Set lastAt to 2 minutes ago - STALLED (strike 1)
  engine.getState().heartbeat.lastAt = new Date(Date.now() - 2 * 60000).toISOString();
  result = engine.checkHeartbeat();
  assert.strictEqual(result.strike, 1, "Strike should be 1");
  assert.strictEqual(result.status, "STALLED", "Status should be STALLED");

  // Set lastAt to 2.5 minutes ago - ESCALATED (strike 2)
  engine.getState().heartbeat.lastAt = new Date(Date.now() - 2.5 * 60000).toISOString();
  result = engine.checkHeartbeat();
  assert.strictEqual(result.strike, 2, "Strike should be 2");
  assert.strictEqual(result.status, "ESCALATED", "Status should be ESCALATED");

  // Set lastAt to 4 minutes ago - HARD_STOP (strike 3)
  engine.getState().heartbeat.lastAt = new Date(Date.now() - 4 * 60000).toISOString();
  result = engine.checkHeartbeat();
  assert.strictEqual(result.strike, 3, "Strike should be 3 (MAX_STRIKES)");
  assert.strictEqual(result.status, "HARD_STOP", "Status should be HARD_STOP");
});

test("watchdog: advanceScheme returns failure object when heartbeat check fails", () => {
  clearRegistry();
  const engine = createTaskEngine(createTestEngineConfig({"sla_work_minutes":1}));

  // Register PLAN artifact
  engine.registerArtifact(createPassArtifact("BUILDER", "PLAN", "2026-03-23T00:00:00-05:00"), { autoSave: false });

  // Simulate stalled heartbeat
  engine.getState().heartbeat.lastAt = new Date(Date.now() - 2 * 60000).toISOString();

  const result = engine.advanceScheme();
  
  // Verify the return format includes failure info
  assert.strictEqual(typeof result.ok, "boolean", "Result should have ok property");
  assert.strictEqual(result.ok, false, "Result.ok should be false");
  assert.ok(result.failure, "Result should have failure property");
  assert.ok(result.failure.type, "Failure should have type");
  assert.ok(result.failure.reason, "Failure should have reason");
  assert.strictEqual(result.failure.type, "RETRY", "Failure type should be RETRY");
});

test("watchdog: failure routing types match Task Engine error format", () => {
  clearRegistry();
  const engine = createTaskEngine(createTestEngineConfig({"sla_work_minutes":1,"escalation_minutes":2,"hard_stop_minutes":3}));

  // Register PLAN artifact
  engine.registerArtifact(createPassArtifact("BUILDER", "PLAN", "2026-03-23T00:00:00-05:00"), { autoSave: false });

  // Test STALLED (strike 1)
  engine.getState().heartbeat.lastAt = new Date(Date.now() - 2 * 60000).toISOString();
  const stalled = engine.advanceScheme();
  assert.strictEqual(stalled.failure.type, "RETRY", "STALLED should trigger RETRY");

  // Test ESCALATED (strike 2)
  engine.getState().heartbeat.lastAt = new Date(Date.now() - 2.5 * 60000).toISOString();
  const escalated = engine.advanceScheme();
  assert.strictEqual(escalated.failure.type, "ESCALATE", "ESCALATED should trigger ESCALATE");

  // Test HARD_STOP (strike 3)
  engine.getState().heartbeat.lastAt = new Date(Date.now() - 4 * 60000).toISOString();
  const hardStop = engine.advanceScheme();
  assert.strictEqual(hardStop.failure.type, "DEFER", "HARD_STOP should trigger DEFER");
});

test("watchdog: registerArtifact resets heartbeat even after strikes", () => {
  clearRegistry();
  const engine = createTaskEngine(createTestEngineConfig({"sla_work_minutes":1}));

  // Set lastAt to 2 minutes ago (STALLED)
  engine.getState().heartbeat.lastAt = new Date(Date.now() - 2 * 60000).toISOString();
  let result = engine.checkHeartbeat();
  assert.strictEqual(result.strike, 1, "Should be strike 1");

  // Register artifact (should reset heartbeat)
  engine.registerArtifact(createPassArtifact("BUILDER", "PLAN", new Date().toISOString()), { autoSave: false });

  // Check heartbeat again
  result = engine.checkHeartbeat();
  assert.strictEqual(result.strike, 0, "Strike should be reset to 0");
  assert.strictEqual(result.status, "ACTIVE", "Status should be ACTIVE");
});

test("watchdog: heartbeat state persists in advanced state", () => {
  clearRegistry();
  const engine = createTaskEngine(createTestEngineConfig());

  // Register PLAN artifact and advance
  engine.registerArtifact(createPassArtifact("BUILDER", "PLAN", "2026-03-23T00:00:00-05:00"), { autoSave: false });
  const advanced = engine.advanceScheme();

  // Verify heartbeat is included in advanced state
  assert.ok(advanced.heartbeat, "Advanced state should include heartbeat");
  assert.strictEqual(advanced.heartbeat.status, "ACTIVE", "Heartbeat status should be ACTIVE");
  assert.strictEqual(advanced.heartbeat.strike, 0, "Strike should be 0");
});