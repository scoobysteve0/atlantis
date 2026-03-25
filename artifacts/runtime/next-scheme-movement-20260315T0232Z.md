# Next Scheme Movement Runtime Proof

```json
{
  "phase": {
    "phaseNumber": 1,
    "phaseHuman": "Audit",
    "step": 3,
    "owner": "AUDITOR",
    "scheme": "ACCEPTANCE_CHECK",
    "status": "IN_PROGRESS",
    "stopTarget": "REAL_ARTIFACT_REQUIRED_FOR_STEP_ADVANCE",
    "lastProofEvent": "NEXT_SLICE:capture-first-scheme-movement",
    "nextTrigger": "refresh_validation"
  },
  "latestMovement": {
    "at": "2026-03-15T02:28:30.877Z",
    "message": "SCHEME_MOVEMENT EXECUTION_PROOF → ACCEPTANCE_CHECK",
    "meta": {
      "kind": "scheme-movement",
      "ok": true,
      "phase": "Audit",
      "step": 3,
      "owner": "AUDITOR",
      "ownerModel": "grok-4-reasoning",
      "fromScheme": "EXECUTION_PROOF",
      "toScheme": "ACCEPTANCE_CHECK",
      "commandExecuted": "Proof tab renders Notification Proof and provides artifact-backed Builder evidence for scheme movement.",
      "filesChanged": [
        "src/renderer/js/ui/dashboard-ui.js",
        "src/renderer/js/main.js"
      ],
      "artifactPath": "artifacts/proof/notification-proof-tab-runtime-20260315T0212Z.md",
      "validationResult": "node --check src/renderer/js/ui/dashboard-ui.js | node --check src/renderer/js/main.js",
      "timestamp": "2026-03-15T02:28:30.874Z",
      "reason": null
    },
    "rendered": "[9:28:30 PM] SCHEME_MOVEMENT EXECUTION_PROOF → ACCEPTANCE_CHECK"
  },
  "previousMovement": {
    "at": "2026-03-15T02:28:27.274Z",
    "message": "SCHEME_MOVEMENT DELTA_PROOF → EXECUTION_PROOF",
    "meta": {
      "kind": "scheme-movement",
      "ok": true,
      "phase": "Review",
      "step": 2,
      "owner": "REVIEWER",
      "ownerModel": "Gemini-3-preview",
      "fromScheme": "DELTA_PROOF",
      "toScheme": "EXECUTION_PROOF",
      "commandExecuted": "Proof tab renders Notification Proof and provides artifact-backed Builder evidence for scheme movement.",
      "filesChanged": [
        "src/renderer/js/ui/dashboard-ui.js",
        "src/renderer/js/main.js"
      ],
      "artifactPath": "artifacts/proof/notification-proof-tab-runtime-20260315T0212Z.md",
      "validationResult": "node --check src/renderer/js/ui/dashboard-ui.js | node --check src/renderer/js/main.js",
      "timestamp": "2026-03-15T02:28:27.272Z",
      "reason": null
    },
    "rendered": "[9:28:27 PM] SCHEME_MOVEMENT DELTA_PROOF → EXECUTION_PROOF"
  },
  "movementCount": 3
}
```
