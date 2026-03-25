/**
 * Atlantis Artifact Registry
 * 
 * Provides indexing and lookup for Atlantis artifacts by phase/step/owner/scheme.
 * 
 * Functions:
 * - registerArtifact: Add artifact to registry index
 * - lookupArtifact: Find artifact by coordinates
 * - getArtifactHistory: List all artifacts in a step
 * - getLatestArtifact: Get most recent artifact matching criteria
 * - clearRegistry: Clear in-memory index (for testing)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadArtifact as bridgeLoadArtifact, listArtifacts as bridgeListArtifacts, getArtifactsDir as bridgeGetArtifactsDir, serializeArtifact, deserializeArtifact, saveArtifact } from './artifact-bridge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_INDEX_FILE = path.join(__dirname, '..', '..', 'data', 'registry-index.json');

// In-memory index for fast lookups
let registryIndex = {
  artifacts: [],  // Array of { phase, step, owner, scheme, result, timestamp, filepath }
  lastUpdated: null
};

/**
 * Load registry index from disk
 */
function loadRegistryIndex() {
  try {
    if (fs.existsSync(REGISTRY_INDEX_FILE)) {
      const data = fs.readFileSync(REGISTRY_INDEX_FILE, 'utf8');
      registryIndex = JSON.parse(data);
    }
  } catch (e) {
    console.warn('Failed to load registry index:', e.message);
    registryIndex = { artifacts: [], lastUpdated: null };
  }
}

/**
 * Save registry index to disk
 */
function saveRegistryIndex() {
  const dataDir = path.dirname(REGISTRY_INDEX_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  registryIndex.lastUpdated = new Date().toISOString();
  fs.writeFileSync(REGISTRY_INDEX_FILE, JSON.stringify(registryIndex, null, 2), 'utf8');
}

/**
 * Register an artifact in the registry index
 * @param {Object} artifact - Artifact to register
 * @param {string} filepath - Path where artifact is stored
 */
function registerArtifact(artifact, filepath) {
  loadRegistryIndex();
  
  // Check if already registered (by filepath)
  const existingIndex = registryIndex.artifacts.findIndex(a => a.filepath === filepath);
  
  const entry = {
    phase: artifact.phase,
    step: artifact.step,
    owner: artifact.owner,
    scheme: artifact.scheme,
    result: artifact.result,
    timestamp: artifact.timestamp,
    project_id: artifact.project_id,
    filepath: filepath
  };
  
  if (existingIndex >= 0) {
    registryIndex.artifacts[existingIndex] = entry;
  } else {
    registryIndex.artifacts.push(entry);
  }
  
  saveRegistryIndex();
  return entry;
}

/**
 * Lookup artifacts by phase, step, owner, and/or scheme
 * @param {Object} criteria - Search criteria
 * @returns {Array<Object>} Matching artifact entries
 */
function lookupArtifact(criteria) {
  loadRegistryIndex();
  
  return registryIndex.artifacts.filter(artifact => {
    if (criteria.phase && artifact.phase !== criteria.phase) return false;
    if (criteria.step && artifact.step !== criteria.step) return false;
    if (criteria.owner && artifact.owner !== criteria.owner) return false;
    if (criteria.scheme && artifact.scheme !== criteria.scheme) return false;
    if (criteria.result && artifact.result !== criteria.result) return false;
    if (criteria.project_id && artifact.project_id !== criteria.project_id) return false;
    return true;
  });
}

/**
 * Get the latest artifact matching criteria
 * @param {Object} criteria - Search criteria
 * @returns {Object|null} Latest matching artifact or null
 */
function getLatestArtifact(criteria = {}) {
  const results = lookupArtifact(criteria);
  if (results.length === 0) return null;
  
  // Sort by timestamp descending
  results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return results[0];
}

/**
 * Get all artifacts for a specific phase and step
 * @param {string} phase - Phase identifier
 * @param {string} step - Step identifier
 * @returns {Array<Object>} All artifacts in the step
 */
function getArtifactHistory(phase, step) {
  return lookupArtifact({ phase, step });
}

/**
 * Get full artifact data (including content) by filepath
 * @param {string} filepath - Path to artifact file
 * @returns {Object} Full artifact object
 */
function getArtifactData(filepath) {
  return bridgeLoadArtifact(filepath);
}

/**
 * Clear the in-memory registry (mainly for testing)
 */
function clearRegistry() {
  registryIndex = { artifacts: [], lastUpdated: null };
  if (fs.existsSync(REGISTRY_INDEX_FILE)) {
    fs.unlinkSync(REGISTRY_INDEX_FILE);
  }
}

/**
 * Rebuild registry index from artifacts directory
 */
function rebuildRegistry() {
  const artifactsDir = bridgeGetArtifactsDir();
  
  if (!fs.existsSync(artifactsDir)) {
    console.log('No artifacts directory found');
    return;
  }
  
  // Clear existing index
  clearRegistry();
  
  // Scan for artifacts recursively
  let added = 0;
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (file.endsWith('.json')) {
        try {
          const artifact = bridgeLoadArtifact(fullPath);
          registerArtifact(artifact, fullPath);
          added++;
        } catch (e) {
          console.warn(`Skipping invalid artifact: ${fullPath}`);
        }
      }
    }
  }
  
  scanDirectory(artifactsDir);
  
  console.log(`Registry rebuilt: ${added} artifacts indexed`);
  return added;
}

/**
 * Get registry statistics
 */
function getRegistryStats() {
  loadRegistryIndex();
  
  const stats = {
    total: registryIndex.artifacts.length,
    byPhase: {},
    byOwner: {},
    byResult: {}
  };
  
  for (const artifact of registryIndex.artifacts) {
    // By phase
    stats.byPhase[artifact.phase] = (stats.byPhase[artifact.phase] || 0) + 1;
    // By owner
    stats.byOwner[artifact.owner] = (stats.byOwner[artifact.owner] || 0) + 1;
    // By result
    stats.byResult[artifact.result] = (stats.byResult[artifact.result] || 0) + 1;
  }
  
  return stats;
}

export {
  registerArtifact,
  lookupArtifact,
  getLatestArtifact,
  getArtifactHistory,
  getArtifactData,
  clearRegistry,
  rebuildRegistry,
  getRegistryStats,
  loadRegistryIndex
};