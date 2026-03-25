const ORCHESTRATION_KEY = "atlantis.orchestration.v1";

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
  clear() { this.map.clear(); }
}

globalThis.localStorage = new MemoryStorage();

const mod = await import(new URL('./src/renderer/js/core/orchestration-service.js', `file://${process.cwd()}/`));
const { createOrchestrationService } = mod;

const baseState = {
  projectId: 'atlantis-agent-monitoring',
  autoRun: true,
  automationTargetScheme: 'FINAL_VERDICT',
  queue: [
    { id: 'builder-task', title: 'builder', detail: '', owner: 'BUILDER', status: 'pending' },
    { id: 'reviewer-task', title: 'reviewer', detail: '', owner: 'REVIEWER', status: 'pending' },
    { id: 'auditor-task', title: 'auditor', detail: '', owner: 'AUDITOR', status: 'pending' },
    { id: 'supervisor-task', title: 'supervisor', detail: '', owner: 'SUPERVISOR', status: 'pending' }
  ],
  phase: {
    phaseNumber: 1,
    phaseHuman: 'Build',
    step: 1,
    owner: 'BUILDER',
    scheme: 'ARTIFACTS_REVIEWED',
    status: 'IN_PROGRESS',
    stopTarget: 'REAL_ARTIFACT_REQUIRED_FOR_STEP_ADVANCE',
    lastProofEvent: 'STEP_STARTED:BUILDER',
    nextTrigger: 'builder_execution'
  },
  metrics: {
    refreshSuccesses: 1,
    refreshFailures: 0,
    lastHealthyAt: null,
    lastSupervisorTickAt: null,
    fallbackSince: null
  },
  blocker: null,
  activeSlice: { id: 'slice', title: 'slice', status: 'running', owner: 'BUILDER' },
  proofLog: [],
  eventLog: [],
  notificationQueue: [],
  lastMovementAt: null
};

function proof(owner, ownerModel, artifactPath) {
  return {
    id: `proof-${owner.toLowerCase()}`,
    owner,
    ownerModel,
    status: 'done',
    validationResult: 'PASS',
    validations: ['PASS'],
    artifacts: [artifactPath],
    files: [`${owner.toLowerCase()}.js`],
    summary: `${owner} PASS artifact`
  };
}

function runScenario(name, statePatch) {
  globalThis.localStorage.clear();
  globalThis.localStorage.setItem(ORCHESTRATION_KEY, JSON.stringify({ ...baseState, ...statePatch }));
  const service = createOrchestrationService({ pollIntervalMs: 4000 });
  const state = service.runSupervisorTick();
  return {
    name,
    owner: state.phase.owner,
    scheme: state.phase.scheme,
    status: state.phase.status,
    lastProofEvent: state.phase.lastProofEvent,
    nextTrigger: state.phase.nextTrigger,
    phaseNumber: state.phase.phaseNumber,
    queuedNotifications: (state.notificationQueue || []).map((n) => ({ owner: n.owner, toScheme: n.toScheme, trigger: n.trigger })),
    queue: state.queue.map((item) => ({ owner: item.owner, status: item.status }))
  };
}

const results = [
  runScenario('builder-pass', {
    phase: { ...baseState.phase, owner: 'BUILDER', step: 1, scheme: 'ARTIFACTS_REVIEWED' },
    activeSlice: { ...baseState.activeSlice, owner: 'BUILDER' },
    proofLog: [proof('BUILDER', 'qwen3-next-coder:cloud', 'artifacts/runtime/builder-pass.md')]
  }),
  runScenario('reviewer-pass', {
    phase: { ...baseState.phase, phaseHuman: 'Review', owner: 'REVIEWER', step: 2, scheme: 'DELTA_PROOF' },
    activeSlice: { ...baseState.activeSlice, owner: 'REVIEWER' },
    proofLog: [proof('REVIEWER', 'Gemini-3-preview', 'artifacts/runtime/reviewer-pass.md')]
  }),
  runScenario('auditor-pass', {
    phase: { ...baseState.phase, phaseHuman: 'Audit', owner: 'AUDITOR', step: 3, scheme: 'EXECUTION_PROOF' },
    activeSlice: { ...baseState.activeSlice, owner: 'AUDITOR' },
    proofLog: [proof('AUDITOR', 'grok-4-reasoning', 'artifacts/runtime/auditor-pass.md')]
  }),
  runScenario('supervisor-final-pass', {
    phase: { ...baseState.phase, phaseHuman: 'Supervise', owner: 'SUPERVISOR', step: 4, scheme: 'FINAL_VERDICT', status: 'IN_PROGRESS' },
    activeSlice: { ...baseState.activeSlice, owner: 'SUPERVISOR' },
    proofLog: [proof('SUPERVISOR', 'gpt5.3-codex', 'artifacts/runtime/supervisor-pass.md')]
  })
];

console.log(JSON.stringify(results, null, 2));
