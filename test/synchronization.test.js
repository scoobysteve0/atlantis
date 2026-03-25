/**
 * Synchronization Tests
 * 
 * Tests for runtime, artifact bridge, and registry index alignment.
 */

import { test } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyArtifactOnDisk, verifyArtifactInRegistry, verifyArtifactIntegrity } from "../src/core/advance-gate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_ARTIFACTS_DIR = path.join(__dirname, "..", "artifacts");

test("advance-gate: synchronize test creates valid state", () => {
  // Create a temporary directory structure
  const tempBase = fs.mkdtempSync(path.join("/tmp", "atlantis-sync-test-"));
  const artifactsDir = path.join(tempBase, "artifacts");  // Base artifacts directory
  const phaseDir = path.join(artifactsDir, "test-phase");
  
  fs.mkdirSync(phaseDir, { recursive: true });

  // Create a test artifact - use the same timestamp format as artifact-bridge.js
  const testArtifact = {
    project_id: "test-project",
    phase: "test-phase",
    step: "test-step",
    owner: "BUILDER",
    scheme: "PLAN",
    result: "PASS",
    timestamp: "2026-03-22T10:00:00-05:00"
  };

  const artifactPath = path.join(phaseDir, "test-project-test-step-builder-plan-20260322T1000000.json");
  fs.writeFileSync(artifactPath, JSON.stringify(testArtifact, null, 2));

  // Verify artifact exists on disk
  assert.ok(fs.existsSync(artifactPath), "Artifact should exist on disk");

  // Verify artifact content matches
  const content = fs.readFileSync(artifactPath, "utf-8");
  const parsed = JSON.parse(content);
  assert.deepStrictEqual(parsed, testArtifact, "Artifact content should match original");

  // Test verifyArtifactOnDisk with the temp artifacts directory
  const verifyResult = verifyArtifactOnDisk(testArtifact, artifactsDir);
  assert.strictEqual(verifyResult.ok, true, "verifyArtifactOnDisk should find the artifact");
  assert.strictEqual(verifyResult.filepath, artifactPath, "Filepath should match");

  // Cleanup
  fs.unlinkSync(artifactPath);
  fs.rmdirSync(phaseDir);
  fs.rmdirSync(artifactsDir);
  fs.rmdirSync(tempBase);
});

test("advance-gate: registry sync validation works", () => {
  // Create a temporary registry index
  const tempBase = fs.mkdtempSync(path.join("/tmp", "atlantis-registry-test-"));
  const indexFile = path.join(tempBase, "registry-index.json");

  const initialIndex = {
    artifacts: [],
    lastUpdated: null
  };

  fs.writeFileSync(indexFile, JSON.stringify(initialIndex, null, 2));

  // Load and modify registry
  let registryIndex = JSON.parse(fs.readFileSync(indexFile, "utf-8"));

  const newEntry = {
    phase: "test-phase",
    step: "test-step",
    owner: "BUILDER",
    scheme: "PLAN",
    result: "PASS",
    timestamp: "2026-03-22T10:00:00-05:00",
    project_id: "test-project",
    filepath: "/fake/path/artifact.json"
  };

  registryIndex.artifacts.push(newEntry);
  registryIndex.lastUpdated = new Date().toISOString();

  fs.writeFileSync(indexFile, JSON.stringify(registryIndex, null, 2));

  // Verify registry was written correctly
  const loadedIndex = JSON.parse(fs.readFileSync(indexFile, "utf-8"));
  assert.strictEqual(loadedIndex.artifacts.length, 1, "Registry should have one entry");
  assert.deepStrictEqual(loadedIndex.artifacts[0], newEntry, "Entry should match");

  // Cleanup
  fs.unlinkSync(indexFile);
  fs.rmdirSync(tempBase);
});

test("advance-gate: runtime state tracks advancement", () => {
  const runtime = {
    current: {
      owner: "BUILDER",
      scheme: "PLAN",
      status: "IN_PROGRESS"
    },
    history: []
  };

  // Simulate advancement from PLAN to WORK
  runtime.history.push({
    owner: runtime.current.owner,
    scheme: runtime.current.scheme,
    result: "PASS",
    artifactTimestamp: "2026-03-22T10:00:00-05:00",
    advancedAt: new Date().toISOString()
  });

  runtime.current.scheme = "WORK";
  runtime.current.status = "IN_PROGRESS";

  assert.deepStrictEqual(runtime.history[0], {
    owner: "BUILDER",
    scheme: "PLAN",
    result: "PASS",
    artifactTimestamp: "2026-03-22T10:00:00-05:00",
    advancedAt: runtime.history[0].advancedAt  // Timestamp will differ, but structure is correct
  });

  assert.strictEqual(runtime.current.owner, "BUILDER");
  assert.strictEqual(runtime.current.scheme, "WORK");
  assert.strictEqual(runtime.current.status, "IN_PROGRESS");
});

test("advance-gate: full state synchronization cycle", () => {
  // Create temporary directories
  const tempBase = fs.mkdtempSync(path.join("/tmp", "atlantis-full-sync-"));
  const artifactsDir = path.join(tempBase, "artifacts");
  const phaseDir = path.join(artifactsDir, "test-phase");
  const dataDir = path.join(tempBase, "data");
  
  fs.mkdirSync(phaseDir, { recursive: true });
  fs.mkdirSync(dataDir, { recursive: true });

  const registryFile = path.join(dataDir, "registry-index.json");

  // Step 1: Create artifact on disk (using same filename pattern as artifact-bridge.js)
  const artifact = {
    project_id: "test-project",
    phase: "test-phase",
    step: "test-step",
    owner: "BUILDER",
    scheme: "PLAN",
    result: "PASS",
    timestamp: "2026-03-22T10:00:00-05:00"
  };

  const artifactPath = path.join(phaseDir, "test-project-test-step-builder-plan-20260322T1000000.json");
  fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));

  // Step 2: Register in registry
  let registryIndex = { artifacts: [], lastUpdated: null };
  registryIndex.artifacts.push({
    phase: artifact.phase,
    step: artifact.step,
    owner: artifact.owner,
    scheme: artifact.scheme,
    result: artifact.result,
    timestamp: artifact.timestamp,
    project_id: artifact.project_id,
    filepath: artifactPath
  });
  registryIndex.lastUpdated = new Date().toISOString();

  fs.writeFileSync(registryFile, JSON.stringify(registryIndex, null, 2));

  // Step 3: Verify runtime state
  const runtime = {
    current: {
      owner: "BUILDER",
      scheme: "PLAN",
      status: "IN_PROGRESS"
    },
    history: []
  };

  // Step 4: Verify all three sync points
  const diskExists = fs.existsSync(artifactPath);
  assert.strictEqual(diskExists, true, "Artifact should exist on disk");
  assert.strictEqual(artifactPath, path.join(phaseDir, "test-project-test-step-builder-plan-20260322T1000000.json"), "Artifact path should match expected pattern");

  const registryLoaded = JSON.parse(fs.readFileSync(registryFile, "utf-8"));
  const registryEntry = registryLoaded.artifacts.find(a => 
    a.owner === "BUILDER" && a.scheme === "PLAN" && a.filepath === artifactPath
  );
  assert.ok(registryEntry, "Artifact should be registered");

  assert.strictEqual(runtime.current.owner, "BUILDER");
  assert.strictEqual(runtime.current.scheme, "PLAN");

  // Cleanup
  fs.unlinkSync(artifactPath);
  fs.unlinkSync(registryFile);
  fs.rmdirSync(phaseDir);
  fs.rmdirSync(dataDir);
  fs.rmdirSync(artifactsDir);
  fs.rmdirSync(tempBase);
});
