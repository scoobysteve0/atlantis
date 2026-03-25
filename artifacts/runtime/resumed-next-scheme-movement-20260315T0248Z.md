# Resumed Automation Next Scheme Movement

## Endpoint verification
- DevTools endpoint: http://127.0.0.1:9222/json/list
- endpointLive: true

## Runtime result
```json
{
  "prep": {
    "currentScheme": "FINAL_VERDICT",
    "automationTargetScheme": "DELTA_PROOF",
    "nextTrigger": "supervisor_closeout"
  },
  "endpointLive": true,
  "phase": {
    "phaseNumber": 1,
    "phaseHuman": "Build",
    "step": 4,
    "owner": "SUPERVISOR",
    "scheme": "FINAL_VERDICT",
    "status": "READY_FOR_PHASE_CLOSE",
    "stopTarget": "REAL_ARTIFACT_REQUIRED_FOR_STEP_ADVANCE",
    "lastProofEvent": "QUEUE_EMPTY_REVIEW_READY",
    "nextTrigger": "supervisor_closeout"
  },
  "autoRun": true,
  "automationTargetScheme": "DELTA_PROOF",
  "latestMovement": null,
  "movementCount": 0,
  "lastTick": "2026-03-15T02:48:06.022Z"
}
```
