# Acceptance Closeout Next Movement Proof

```json
{
  "complete": {
    "beforePhase": {
      "phaseNumber": 1,
      "phaseHuman": "Audit",
      "step": 3,
      "owner": "AUDITOR",
      "scheme": "ACCEPTANCE_CHECK",
      "status": "IN_PROGRESS",
      "stopTarget": "REAL_ARTIFACT_REQUIRED_FOR_STEP_ADVANCE",
      "lastProofEvent": "QUEUE_EMPTY_REVIEW_READY",
      "nextTrigger": "acceptance_check_complete"
    },
    "completedItem": {
      "id": "acceptance-closeout-live",
      "title": "Finalize acceptance closeout from live runtime state",
      "detail": "Pending pre-final work retained so automation can advance forward to FINAL_VERDICT.",
      "owner": "SUPERVISOR",
      "dependsOn": "ACCEPTANCE_CHECK",
      "status": "done"
    }
  },
  "result": {
    "phase": {
      "phaseNumber": 1,
      "phaseHuman": "Audit",
      "step": 4,
      "owner": "SUPERVISOR",
      "scheme": "FINAL_VERDICT",
      "status": "READY_FOR_PHASE_CLOSE",
      "stopTarget": "REAL_ARTIFACT_REQUIRED_FOR_STEP_ADVANCE",
      "lastProofEvent": "QUEUE_EMPTY_REVIEW_READY",
      "nextTrigger": "supervisor_closeout"
    },
    "movement": null,
    "movementCount": 0,
    "lastTick": "2026-03-15T02:56:25.889Z"
  }
}
```
