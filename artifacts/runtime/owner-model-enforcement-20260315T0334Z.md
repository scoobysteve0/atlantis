# Owner-Model Enforcement Proof

## Commands
node --check src/main/index.js
node --check src/renderer/js/core/orchestration-service.js
node --check src/renderer/js/main.js

## Files
- src/renderer/js/core/orchestration-service.js
- src/renderer/js/main.js

## Enforcement
Scheme notifications now include STEP_OWNER, SCHEME_OWNER, MODEL.
Workflow advancement now requires owner-specific proof/model checks for Builder, Reviewer, Auditor.

Log metadata now persists stepOwner/schemeOwner.
