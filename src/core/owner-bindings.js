import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const LOCKED_OWNER_ROLES = ["REVIEWER", "AUDITOR", "SUPERVISOR"];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_BINDINGS_PATH = path.resolve(__dirname, "../../config/owner-bindings.json");

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function loadOwnerBindings(bindingsPath = DEFAULT_BINDINGS_PATH) {
  const raw = fs.readFileSync(bindingsPath, "utf8");
  const parsed = JSON.parse(raw);
  validateOwnerBindings(parsed);
  return parsed;
}

export function validateOwnerBindings(bindings) {
  if (!bindings || typeof bindings !== "object" || Array.isArray(bindings)) {
    throw new Error("owner bindings must be an object");
  }

  if (!bindings.owners || typeof bindings.owners !== "object" || Array.isArray(bindings.owners)) {
    throw new Error("owner bindings must include an owners object");
  }

  LOCKED_OWNER_ROLES.forEach((owner) => {
    const binding = bindings.owners[owner];
    if (!binding || typeof binding !== "object" || Array.isArray(binding)) {
      throw new Error(`owner bindings missing ${owner}`);
    }
    if (!isNonEmptyString(binding.sessionKey)) {
      throw new Error(`${owner} binding requires sessionKey`);
    }
    if (!isNonEmptyString(binding.model)) {
      throw new Error(`${owner} binding requires model`);
    }
  });

  return true;
}

export function hasOwnerBinding(owner, bindings = loadOwnerBindings()) {
  return Boolean(bindings.owners?.[owner]);
}

export function getOwnerBinding(owner, bindings = loadOwnerBindings()) {
  return hasOwnerBinding(owner, bindings) ? clone(bindings.owners[owner]) : null;
}

export function getOwnerSessionKey(owner, bindings = loadOwnerBindings()) {
  const binding = getOwnerBinding(owner, bindings);
  return binding ? binding.sessionKey : null;
}

export function getOwnerModel(owner, bindings = loadOwnerBindings()) {
  const binding = getOwnerBinding(owner, bindings);
  return binding ? binding.model : null;
}

export function assertOwnerActivationReady({ owner, activeSessionKey, activeModel, artifactPath }, bindings = loadOwnerBindings()) {
  const binding = getOwnerBinding(owner, bindings);

  if (!binding) {
    return {
      ok: true,
      owner,
      binding: null,
      issues: [],
      blockStatus: "UNBOUND",
      enforced: false
    };
  }

  const issues = [];

  if (activeSessionKey !== binding.sessionKey) {
    issues.push(`session mismatch: expected ${binding.sessionKey}, got ${activeSessionKey || "<missing>"}`);
  }

  if (activeModel !== binding.model) {
    issues.push(`model mismatch: expected ${binding.model}, got ${activeModel || "<missing>"}`);
  }

  if (!isNonEmptyString(artifactPath)) {
    issues.push("expected artifact path missing");
  }

  return {
    ok: issues.length === 0,
    owner,
    binding,
    issues,
    blockStatus: issues.length ? "BLOCKED" : "READY",
    enforced: true
  };
}

export const ownerRoles = LOCKED_OWNER_ROLES;
export const defaultOwnerBindingsPath = DEFAULT_BINDINGS_PATH;
