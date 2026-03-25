# Scheme Movement Automation Proof

Implemented automatic Atlantis scheme progression and movement notifications.

## Changed files
- src/renderer/js/core/orchestration-service.js
- src/renderer/js/main.js

## Behavior added
- auto-advance through `ARTIFACTS_REVIEWED → DELTA_PROOF → EXECUTION_PROOF → ACCEPTANCE_CHECK → FINAL_VERDICT`
- owner mapping:
  - Step 1 Builder / `qwen3-next-coder:cloud`
  - Step 2 Reviewer / `Gemini-3-preview`
  - Step 3 Auditor / `grok-4-reasoning`
  - Step 4 Supervisor / `gpt5.3-codex`
- queue per-movement notification payloads with scheme, owner, files, artifact, validation, and timestamp
- emit `SCHEME_MOVEMENT` notifications from the renderer refresh loop

## Validation
- `node --check src/renderer/js/core/orchestration-service.js`
- `node --check src/renderer/js/main.js`
