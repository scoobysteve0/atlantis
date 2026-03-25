/**
 * Advance Gate - Hard enforcement of Atlantis workflow advancement rules
 * 
 * This module provides:
 * - Owner rotation validation (BUILDER -> REVIEWER -> AUDITOR -> SUPERVISOR)
 * - Scheme progression validation (PLAN -> WORK -> VERIFY)
 * - Artifact integrity verification (disk + registry + runtime sync)
 * - Advance enforcement with actionable error messages
 */

import { getLatestArtifact } from "./artifact-registry.js";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OWNER_SEQUENCE = ["BUILDER", "REVIEWER", "AUDITOR", "SUPERVISOR"];
const SCHEME_SEQUENCE = ["PLAN", "WORK", "VERIFY"];
const DEFAULT_ARTIFACTS_DIR = join(__dirname, "..", "..", "artifacts");

/**
 * Validate owner rotation is legal
 * @param {string} currentOwner - Current owner
 * @param {string} nextOwner - Proposed next owner
 * @returns {Object} { ok: boolean, error?: string }
 */
export function validateOwnerRotation(currentOwner, nextOwner) {
  const currentIdx = OWNER_SEQUENCE.indexOf(currentOwner);
  const nextIdx = OWNER_SEQUENCE.indexOf(nextOwner);

  if (currentIdx === -1) {
    return {
      ok: false,
      error: `Unknown current owner: ${currentOwner}. Valid: ${OWNER_SEQUENCE.join(", ")}`
    };
  }

  if (nextIdx === -1) {
    return {
      ok: false,
      error: `Unknown next owner: ${nextOwner}. Valid: ${OWNER_SEQUENCE.join(", ")}`
    };
  }

  // Check if next owner is the immediate successor
  const expectedNextIdx = currentIdx + 1;
  if (nextIdx === expectedNextIdx) {
    return { ok: true };
  }

  if (nextIdx === currentIdx) {
    return {
      ok: false,
      error: `Owner must advance to next in sequence (${OWNER_SEQUENCE[currentIdx + 1]}), not stay at ${currentOwner}`
    };
  }

  if (nextIdx < currentIdx) {
    return {
      ok: false,
      error: `Owner regression detected (${currentOwner} -> ${nextOwner}). Rotation must move forward: ${OWNER_SEQUENCE.join(" -> ")}`
    };
  }

  return {
    ok: false,
    error: `Owner gap detected. After ${currentOwner}, expected ${OWNER_SEQUENCE[currentIdx + 1]}, got ${nextOwner}`
  };
}

/**
 * Validate scheme progression is legal
 * @param {string} currentScheme - Current scheme
 * @param {string} nextScheme - Proposed next scheme
 * @returns {Object} { ok: boolean, error?: string }
 */
export function validateSchemeProgression(currentScheme, nextScheme) {
  const currentIdx = SCHEME_SEQUENCE.indexOf(currentScheme);
  const nextIdx = SCHEME_SEQUENCE.indexOf(nextScheme);

  if (currentIdx === -1) {
    return {
      ok: false,
      error: `Unknown current scheme: ${currentScheme}. Valid: ${SCHEME_SEQUENCE.join(", ")}`
    };
  }

  if (nextIdx === -1) {
    return {
      ok: false,
      error: `Unknown next scheme: ${nextScheme}. Valid: ${SCHEME_SEQUENCE.join(", ")}`
    };
  }

  // Check if next scheme is the immediate successor
  const expectedNextIdx = currentIdx + 1;
  if (nextIdx === expectedNextIdx) {
    return { ok: true };
  }

  if (nextIdx === currentIdx) {
    return {
      ok: false,
      error: `Scheme must advance to next in sequence (${SCHEME_SEQUENCE[currentIdx + 1]}), not stay at ${currentScheme}`
    };
  }

  if (nextIdx < currentIdx) {
    return {
      ok: false,
      error: `Scheme regression detected (${currentScheme} -> ${nextScheme}). Progression must move forward: ${SCHEME_SEQUENCE.join(" -> ")}`
    };
  }

  return {
    ok: false,
    error: `Scheme gap detected. After ${currentScheme}, expected ${SCHEME_SEQUENCE[currentIdx + 1]}, got ${nextScheme}`
  };
}

/**
 * Verify artifact exists on disk
 * @param {Object} artifact - Artifact to verify
 * @returns {Object} { ok: boolean, filepath?: string, error?: string }
 */
export function verifyArtifactOnDisk(artifact, artifactsDir = DEFAULT_ARTIFACTS_DIR) {
  const { project_id, phase, step, owner, scheme, timestamp } = artifact;

  if (!project_id || !phase || !step) {
    return {
      ok: false,
      error: "Artifact missing required coordinates (project_id, phase, step)"
    };
  }

  // Build expected filepath pattern
  const timestampStr = timestamp ? timestamp.replace(/[:-]/g, "").replace("T", "T").slice(0, 16) : "unknown";
  const filename = `${project_id}-${step}-${owner.toLowerCase()}-${scheme.toLowerCase()}-${timestampStr}.json`;
  const filepath = join(artifactsDir, phase, filename);

  if (!existsSync(filepath)) {
    return {
      ok: false,
      filepath,
      error: `Artifact file not found on disk: ${filepath}`
    };
  }

  try {
    const content = readFileSync(filepath, "utf-8");
    const parsed = JSON.parse(content);
    
    // Verify artifact content matches
    if (parsed.owner !== artifact.owner || parsed.scheme !== artifact.scheme) {
      return {
        ok: false,
        filepath,
        error: "Artifact content mismatch on disk"
      };
    }

    return {
      ok: true,
      filepath
    };
  } catch (e) {
    return {
      ok: false,
      filepath,
      error: `Failed to read/parse artifact file: ${e.message}`
    };
  }
}

/**
 * Verify artifact is registered in registry
 * @param {Object} artifact - Artifact to verify
 * @param {string} [artifactsDir] - Optional artifacts directory
 * @returns {Object} { ok: boolean, error?: string }
 */
export function verifyArtifactInRegistry(artifact, artifactsDir = DEFAULT_ARTIFACTS_DIR) {
  const { project_id, phase, step, owner, scheme, timestamp } = artifact;

  if (!project_id || !phase || !step || !owner || !scheme) {
    return {
      ok: false,
      error: "Artifact missing required coordinates (project_id, phase, step, owner, scheme)"
    };
  }

  const registryEntry = getLatestArtifact({
    project_id,
    phase,
    step,
    owner,
    scheme,
    result: "PASS"
  });

  if (!registryEntry) {
    return {
      ok: false,
      error: "Artifact not found in registry"
    };
  }

  // Verify filepath matches (artifact was saved)
  if (!artifactsDir || typeof artifactsDir !== 'string') {
    return {
      ok: false,
      error: `Invalid artifacts directory: ${artifactsDir} (expected string, got ${typeof artifactsDir})`
    };
  }
  const expectedFilename = `${project_id}-${step}-${owner.toLowerCase()}-${scheme.toLowerCase()}-${timestamp ? timestamp.replace(/[:-]/g, "").replace("T", "T").slice(0, 16) : "unknown"}.json`;
  const expectedPath = join(artifactsDir, phase, expectedFilename);
  
  // Only check filepath - timestamp doesn't need to match exactly
  // The important thing is that the artifact exists with correct coordinates
  if (registryEntry.filepath && registryEntry.filepath !== expectedPath) {
    return {
      ok: false,
      error: `Registry filepath mismatch: expected ${expectedPath}, got ${registryEntry.filepath}`
    };
  }

  return {
    ok: true,
    filepath: registryEntry.filepath
  };
}

/**
 * Full artifact integrity verification
 * @param {Object} artifact - Artifact to verify
 * @param {string} [artifactsDir] - Optional custom artifacts directory (defaults to DEFAULT_ARTIFACTS_DIR)
 * @returns {Object} { ok: boolean, filepath?: string, errors?: string[] }
 */
export function verifyArtifactIntegrity(artifact, artifactsDir = DEFAULT_ARTIFACTS_DIR) {
  const errors = [];

  const diskCheck = verifyArtifactOnDisk(artifact, artifactsDir);
  if (!diskCheck.ok) {
    errors.push(diskCheck.error);
  }

  const registryCheck = verifyArtifactInRegistry(artifact, artifactsDir);
  if (!registryCheck.ok) {
    errors.push(registryCheck.error);
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors
    };
  }

  return {
    ok: true,
    filepath: diskCheck.filepath
  };
}

/**
 * Complete advance validation (all gates)
 * @param {Object} params - Validation parameters
 * @param {Object} params.current - Current state { owner, scheme }
 * @param {Object} params.next - Proposed next state { owner, scheme }
 * @param {Object} params.artifact - PASS artifact triggering advancement
 * @returns {Object} { ok: boolean, error?: string }
 */
export function validateAdvance(params) {
  const { current, next, artifact } = params;

  const errors = [];

  // Validate owner rotation
  const ownerResult = validateOwnerRotation(current.owner, next.owner);
  if (!ownerResult.ok) {
    errors.push(ownerResult.error);
  }

  // Validate scheme progression
  const schemeResult = validateSchemeProgression(current.scheme, next.scheme);
  if (!schemeResult.ok) {
    errors.push(schemeResult.error);
  }

  // Verify artifact integrity
  const artifactResult = verifyArtifactIntegrity(artifact);
  if (!artifactResult.ok) {
    if (Array.isArray(artifactResult.errors)) {
      errors.push(...artifactResult.errors);
    } else {
      errors.push(artifactResult.error);
    }
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors: errors.map(e => `  - ${e}`).join("\n")
    };
  }

  return { ok: true };
}

/**
 * Get next legal owner after current
 * @param {string} currentOwner - Current owner
 * @returns {string|null} Next owner or null if at end
 */
export function getNextOwner(currentOwner) {
  const idx = OWNER_SEQUENCE.indexOf(currentOwner);
  if (idx === -1 || idx >= OWNER_SEQUENCE.length - 1) {
    return null;
  }
  return OWNER_SEQUENCE[idx + 1];
}

/**
 * Get next legal scheme after current
 * @param {string} currentScheme - Current scheme
 * @returns {string|null} Next scheme or null if at end
 */
export function getNextScheme(currentScheme) {
  const idx = SCHEME_SEQUENCE.indexOf(currentScheme);
  if (idx === -1 || idx >= SCHEME_SEQUENCE.length - 1) {
    return null;
  }
  return SCHEME_SEQUENCE[idx + 1];
}
