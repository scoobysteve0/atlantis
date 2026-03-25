const ORCHESTRATION_KEY = "atlantis.orchestration.v1";

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
  removeItem(k) { this.map.delete(k); }
  clear() { this.map.clear(); }
}

globalThis.localStorage = new MemoryStorage();

const { createOrchestrationService } = await import(new URL('./src/renderer/js/core/orchestration-service.js', `file://${process.cwd()}/`));

const seeded = {
  projectId: 'atlantis-agent-monitoring',
  autoRun: true,
  automationTargetScheme: 'FINAL_VERDICT',
  queue: [
    { id: 'builder-task', title: 'builder', detail: '', owner: 'BUILDER', status: 'pending' },
    { id: 'reviewer-task', title: 'reviewer', detail: '', owner: 'REVIEWER', status: 'pending' }
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
  activeSlice: { id: 'builder-task', title: 'builder', status: 'running', owner: 'BUILDER' },
  proofLog: [{
    id: 'proof-builder-pass',
    owner: 'BUILDER',
    ownerModel: 'qwen3-next-coder:cloud',
    status: 'done',
    validationResult: 'PASS',
    validations: ['PASS'],
    artifacts: ['artifacts/runtime/builder-pass.md'],
    files: ['src/renderer/js/core/orchestration-service.js'],
    summary: 'BUILDER PASS artifact'
  }],
  eventLog: [],
  notificationQueue: [],
  lastMovementAt: null
};

localStorage.setItem(ORCHESTRATION_KEY, JSON.stringify(seeded));
const service = createOrchestrationService({ pollIntervalMs: 4000 });
const state = service.runSupervisorTick();
const stepStarted = (state.eventLog || []).find((event) => event.type === 'STEP_STARTED');

console.log(JSON.stringify({
  phase: state.phase,
  blocker: state.blocker,
  notification: (state.notificationQueue || [])[0] || null,
  stepStarted
}, null, 2));
