const OWNER_ROLES = ["BUILDER", "REVIEWER", "AUDITOR", "SUPERVISOR"];
const SCHEMES = ["PLAN", "WORK", "VERIFY"];
const FAILURE_ROUTES = ["RETRY", "ESCALATE", "DEFER"];
const DEFAULT_PHASES = [
  { id: 0, key: "DISCOVERY", name: "Discovery" },
  { id: 1, key: "DESIGN", name: "Design" },
  { id: 2, key: "BUILD", name: "Build" },
  { id: 3, key: "VERIFY", name: "Verify" },
  { id: 4, key: "RELEASE", name: "Release" }
];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateStep(step, phaseKey, errors, path) {
  if (!isObject(step)) {
    errors.push(`${path} must be an object`);
    return;
  }

  if (!hasText(step.id)) errors.push(`${path}.id is required`);
  if (!hasText(step.name)) errors.push(`${path}.name is required`);
  if (!Array.isArray(step.schemes) || !step.schemes.length) {
    errors.push(`${path}.schemes must contain PLAN/WORK/VERIFY`);
  } else {
    const invalidSchemes = step.schemes.filter((scheme) => !SCHEMES.includes(scheme));
    if (invalidSchemes.length) errors.push(`${path}.schemes has invalid values: ${invalidSchemes.join(", ")}`);
  }

  if (!Array.isArray(step.acceptance) || !step.acceptance.length) {
    errors.push(`${path}.acceptance must contain at least one acceptance criterion`);
  }

  if (typeof step.workMinutes !== "number" || step.workMinutes <= 0) {
    errors.push(`${path}.workMinutes must be a positive number`);
  }

  if (!hasText(phaseKey)) errors.push(`${path} missing parent phase key`);
}

function validatePhase(phase, errors, path) {
  if (!isObject(phase)) {
    errors.push(`${path} must be an object`);
    return;
  }

  if (!hasText(phase.key)) errors.push(`${path}.key is required`);
  if (!hasText(phase.name)) errors.push(`${path}.name is required`);
  if (!Array.isArray(phase.steps) || !phase.steps.length) {
    errors.push(`${path}.steps must contain at least one step`);
    return;
  }

  phase.steps.forEach((step, index) => validateStep(step, phase.key, errors, `${path}.steps[${index}]`));
}

export const projectDefinitionSchema = {
  version: "phase5.project-definition.v1",
  ownerRoles: OWNER_ROLES,
  schemes: SCHEMES,
  failureRoutes: FAILURE_ROUTES,
  defaultPhases: DEFAULT_PHASES,
  requiredFields: [
    "project_id",
    "project_name",
    "artifact_root",
    "phases",
    "agent_assignments",
    "sla_work_minutes",
    "failure_default"
  ]
};

export function validateProjectDefinition(definition) {
  const errors = [];

  if (!isObject(definition)) {
    return { ok: false, errors: ["project definition must be an object"] };
  }

  if (!hasText(definition.project_id)) errors.push("project_id is required");
  if (!hasText(definition.project_name)) errors.push("project_name is required");
  if (!hasText(definition.artifact_root)) errors.push("artifact_root is required");

  if (!isObject(definition.agent_assignments)) {
    errors.push("agent_assignments is required");
  } else {
    OWNER_ROLES.forEach((owner) => {
      if (!hasText(definition.agent_assignments[owner])) {
        errors.push(`agent_assignments.${owner} is required`);
      }
    });
  }

  if (typeof definition.sla_work_minutes !== "number" || definition.sla_work_minutes <= 0) {
    errors.push("sla_work_minutes must be a positive number");
  }

  if (!FAILURE_ROUTES.includes(definition.failure_default)) {
    errors.push(`failure_default must be one of: ${FAILURE_ROUTES.join(", ")}`);
  }

  if (!Array.isArray(definition.phases) || !definition.phases.length) {
    errors.push("phases must contain at least one phase");
  } else {
    definition.phases.forEach((phase, index) => validatePhase(phase, errors, `phases[${index}]`));
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

export function createExampleProjectDefinitions() {
  return [
    {
      project_id: "atlantis-phase5",
      project_name: "Atlantis Phase 5 — Project Engine",
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
              id: "step-1",
              name: "Project Definition schema",
              schemes: ["PLAN", "WORK", "VERIFY"],
              workMinutes: 45,
              acceptance: ["Schema validates example projects", "Task engine can consume schema"]
            }
          ]
        }
      ]
    },
    {
      project_id: "simple-release",
      project_name: "Simple Release Project",
      artifact_root: "artifacts/simple-release",
      agent_assignments: {
        BUILDER: "ollama/qwen3-next-coder:cloud",
        REVIEWER: "google/gemini-3.1-pro-preview",
        AUDITOR: "grok-4-fast-reasoning",
        SUPERVISOR: "gpt-5.3-codex"
      },
      sla_work_minutes: 30,
      failure_default: "RETRY",
      phases: [
        {
          key: "RELEASE",
          name: "Release",
          steps: [
            {
              id: "step-1",
              name: "Live validation",
              schemes: ["PLAN", "WORK", "VERIFY"],
              workMinutes: 30,
              acceptance: ["Release checklist exists"]
            }
          ]
        }
      ]
    },
    {
      project_id: "verify-only",
      project_name: "Verification Drill",
      artifact_root: "artifacts/verify-only",
      agent_assignments: {
        BUILDER: "ollama/qwen3-next-coder:cloud",
        REVIEWER: "google/gemini-3.1-pro-preview",
        AUDITOR: "grok-4-fast-reasoning",
        SUPERVISOR: "gpt-5.3-codex"
      },
      sla_work_minutes: 20,
      failure_default: "DEFER",
      phases: [
        {
          key: "VERIFY",
          name: "Verify",
          steps: [
            {
              id: "step-1",
              name: "Rollback drill",
              schemes: ["PLAN", "WORK", "VERIFY"],
              workMinutes: 20,
              acceptance: ["Rollback runbook artifact exists"]
            }
          ]
        }
      ]
    }
  ];
}
