# First SCHEME_MOVEMENT After Runtime Reset

## State reset applied
```json
{
  "projectId": "atlantis-agent-monitoring",
  "autoRun": true,
  "automationTargetScheme": "DELTA_PROOF",
  "queue": [
    {
      "id": "capture-first-scheme-movement",
      "title": "Capture first scheme movement runtime proof",
      "detail": "Keep Builder active with a pending queue item so automation can emit the next movement.",
      "owner": "BUILDER",
      "dependsOn": "Ready",
      "status": "pending"
    },
    {
      "id": "persisted-state",
      "title": "Persist orchestration state",
      "detail": "Keep phase, owner, proof, and blockers durable across restarts.",
      "owner": "BUILDER",
      "dependsOn": "Ready",
      "status": "done"
    }
  ],
  "phase": {
    "phaseNumber": 1,
    "phaseHuman": "Build",
    "step": 1,
    "owner": "BUILDER",
    "scheme": "ARTIFACTS_REVIEWED",
    "status": "IN_PROGRESS",
    "stopTarget": "REAL_ARTIFACT_REQUIRED_FOR_STEP_ADVANCE",
    "lastProofEvent": "STEP1_STARTED:ARTIFACTS_REVIEWED",
    "nextTrigger": "builder_execution"
  },
  "metrics": {
    "refreshSuccesses": 0,
    "refreshFailures": 0,
    "lastHealthyAt": null,
    "lastSupervisorTickAt": null,
    "fallbackSince": null
  },
  "blocker": null,
  "activeSlice": {
    "id": "capture-first-scheme-movement",
    "title": "Capture first scheme movement runtime proof",
    "status": "running"
  },
  "proofLog": [
    {
      "id": "proof-notification-proof-tab",
      "title": "Notification Proof tab runtime verification",
      "kind": "runtime",
      "status": "done",
      "summary": "Proof tab renders Notification Proof and provides artifact-backed Builder evidence for scheme movement.",
      "files": [
        "src/renderer/js/ui/dashboard-ui.js",
        "src/renderer/js/main.js"
      ],
      "validations": [
        "node --check src/renderer/js/ui/dashboard-ui.js",
        "node --check src/renderer/js/main.js"
      ],
      "artifacts": [
        "artifacts/proof/notification-proof-tab-runtime-20260315T0212Z.md"
      ]
    }
  ],
  "eventLog": [],
  "notificationQueue": [],
  "lastMovementAt": null
}
```

## Runtime result
```json
{
  "phase": {
    "phaseNumber": 1,
    "phaseHuman": "Review",
    "step": 2,
    "owner": "REVIEWER",
    "scheme": "EXECUTION_PROOF",
    "status": "IN_PROGRESS",
    "stopTarget": "REAL_ARTIFACT_REQUIRED_FOR_STEP_ADVANCE",
    "lastProofEvent": "AUTO_ADVANCED:EXECUTION_PROOF",
    "nextTrigger": "delta_proof_complete"
  },
  "firstPendingQueueItem": {
    "id": "capture-first-scheme-movement",
    "title": "Capture first scheme movement runtime proof",
    "detail": "Keep Builder active with a pending queue item so automation can emit the next movement.",
    "owner": "BUILDER",
    "dependsOn": "Ready",
    "status": "pending"
  },
  "firstMovement": {
    "at": "2026-03-15T02:28:22.980Z",
    "message": "SCHEME_MOVEMENT ARTIFACTS_REVIEWED → DELTA_PROOF",
    "meta": {
      "kind": "scheme-movement",
      "ok": true,
      "phase": "Build",
      "step": 1,
      "owner": "BUILDER",
      "ownerModel": "qwen3-next-coder:cloud",
      "fromScheme": "ARTIFACTS_REVIEWED",
      "toScheme": "DELTA_PROOF",
      "commandExecuted": "Proof tab renders Notification Proof and provides artifact-backed Builder evidence for scheme movement.",
      "filesChanged": [
        "src/renderer/js/ui/dashboard-ui.js",
        "src/renderer/js/main.js"
      ],
      "artifactPath": "artifacts/proof/notification-proof-tab-runtime-20260315T0212Z.md",
      "validationResult": "node --check src/renderer/js/ui/dashboard-ui.js | node --check src/renderer/js/main.js",
      "timestamp": "2026-03-15T02:28:22.975Z",
      "reason": null
    },
    "rendered": "[9:28:22 PM] SCHEME_MOVEMENT ARTIFACTS_REVIEWED → DELTA_PROOF"
  },
  "movementCount": 2
}
```
