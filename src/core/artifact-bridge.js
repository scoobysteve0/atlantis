/**
 * Artifact Bridge - Serialization, persistence, and migration for Atlantis artifacts
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default artifacts directory
export const DEFAULT_ARTIFACTS_DIR = join(__dirname, '../../artifacts');

/**
 * Serialize an artifact to JSON string
 * @param {Object} artifact - Artifact object to serialize
 * @returns {string} JSON string
 */
export function serializeArtifact(artifact) {
  return JSON.stringify(artifact, null, 2);
}

/**
 * Deserialize JSON string to artifact object
 * @param {string} json - JSON string
 * @returns {Object} Parsed artifact object
 */
export function deserializeArtifact(json) {
  const parsed = typeof json === 'string' ? JSON.parse(json) : json;
  
  // Validate required fields
  if (!parsed.owner) throw new Error('Invalid artifact: missing owner');
  if (!parsed.scheme) throw new Error('Invalid artifact: missing scheme');
  if (!parsed.result) throw new Error('Invalid artifact: missing result');
  
  return parsed;
}

/**
 * Save artifact to disk
 * @param {Object} artifact - Artifact to save
 * @param {string} [artifactsDir] - Optional custom artifacts directory
 * @returns {string} Path where artifact was saved
 */
export function saveArtifact(artifact, artifactsDir = DEFAULT_ARTIFACTS_DIR) {
  const { project_id, phase, step, owner, scheme, timestamp } = artifact;
  
  // Build artifact filename
  const timestampStr = timestamp ? timestamp.replace(/[:-]/g, '').replace('T', 'T').slice(0, 16) : 'unknown';
  const filename = `${project_id || 'unknown'}-${step || 'unknown'}-${owner.toLowerCase()}-${scheme.toLowerCase()}-${timestampStr}.json`;
  
  // Create directory if needed
  const dir = join(artifactsDir, phase || 'unknown');
  ensureDirectory(dir);
  
  const filepath = join(dir, filename);
  writeFileSync(filepath, serializeArtifact(artifact), 'utf-8');
  
  return filepath;
}

/**
 * Load artifact from disk
 * @param {string} path - Path to artifact file
 * @returns {Object} Loaded artifact
 */
export function loadArtifact(path) {
  if (!existsSync(path)) {
    throw new Error(`Artifact not found: ${path}`);
  }
  
  const content = readFileSync(path, 'utf-8');
  return deserializeArtifact(content);
}

/**
 * List all artifacts for a given phase and optional step
 * @param {string} phase - Phase name (e.g., 'atlantis-phase5')
 * @param {string} [step] - Optional step filter
 * @param {string} [artifactsDir] - Optional custom artifacts directory
 * @returns {Array<Object>} Array of artifact objects
 */
export function listArtifacts(phase, step, artifactsDir = DEFAULT_ARTIFACTS_DIR) {
  const phaseDir = join(artifactsDir, phase);
  
  if (!existsSync(phaseDir)) {
    return [];
  }
  
  const artifacts = [];
  const files = readdirSync(phaseDir);
  
  for (const file of files) {
    const filepath = join(phaseDir, file);
    const stat = statSync(filepath);
    
    if (stat.isFile() && file.endsWith('.json')) {
      try {
        const artifact = loadArtifact(filepath);
        
        // Filter by step if provided
        if (step && artifact.step !== step) {
          continue;
        }
        
        artifacts.push(artifact);
      } catch (e) {
        // Skip invalid files
        console.warn(`Skipping invalid artifact: ${file}`);
      }
    }
  }
  
  // Sort by timestamp descending
  artifacts.sort((a, b) => {
    const timeA = new Date(a.timestamp || 0);
    const timeB = new Date(b.timestamp || 0);
    return timeB - timeA;
  });
  
  return artifacts;
}

/**
 * Migrate an artifact from one version to another
 * @param {Object} artifact - Artifact to migrate
 * @param {string} fromVersion - Source version
 * @param {string} toVersion - Target version
 * @returns {Object} Migrated artifact
 */
export function migrateArtifact(artifact, fromVersion, toVersion) {
  const migrated = { ...artifact };
  
  // Add migration metadata
  migrated._migrated = {
    fromVersion,
    toVersion,
    migratedAt: new Date().toISOString()
  };
  
  // Version-specific migrations
  if (fromVersion === '1.0' && toVersion === '2.0') {
    // Example: ensure result is uppercase
    if (migrated.result) {
      migrated.result = migrated.result.toUpperCase();
    }
    // Example: normalize owner to uppercase
    if (migrated.owner) {
      migrated.owner = migrated.owner.toUpperCase();
    }
  }
  
  return migrated;
}

/**
 * Verify artifact integrity
 * @param {Object} artifact - Artifact to verify
 * @returns {Object} Verification result { ok: boolean, errors: string[] }
 */
export function verifyArtifact(artifact) {
  const errors = [];
  
  if (!artifact.owner) errors.push('missing owner');
  if (!artifact.scheme) errors.push('missing scheme');
  if (!artifact.result) errors.push('missing result');
  if (!artifact.timestamp) errors.push('missing timestamp');
  if (!artifact.project_id) errors.push('missing project_id');
  if (!artifact.phase) errors.push('missing phase');
  if (!artifact.step) errors.push('missing step');
  
  // Validate result
  if (artifact.result && !['PASS', 'FAIL', 'PENDING'].includes(artifact.result)) {
    errors.push(`invalid result: ${artifact.result}`);
  }
  
  return {
    ok: errors.length === 0,
    errors
  };
}

/**
 * Get the artifacts directory path
 * @returns {string} Path to artifacts directory
 */
export function getArtifactsDir(customDir = DEFAULT_ARTIFACTS_DIR) {
  return customDir;
}

// Helper: ensure directory exists
function ensureDirectory(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export default {
  serializeArtifact,
  deserializeArtifact,
  saveArtifact,
  loadArtifact,
  listArtifacts,
  migrateArtifact,
  verifyArtifact,
  getArtifactsDir
};