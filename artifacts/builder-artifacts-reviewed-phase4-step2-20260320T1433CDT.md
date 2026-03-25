# Builder Artifact — ARTIFACTS_REVIEWED

- Phase: PHASE 4 — RELEASE & LEARN
- Step: Step 2
- Step Objective: Fix known display bugs in Atlantis application
- Owner: BUILDER
- Owner Model: openai-codex/gpt-5.4
- Scheme: ARTIFACTS_REVIEWED
- Validation Result: PASS
- Timestamp: 2026-03-20 14:33 CDT

## Review Scope
Reviewed the active Step 2 inputs and the Atlantis app surfaces tied to the known display bugs.

Inputs reviewed:
- `atlantis-electron/docs/ATLANTIS_STATUS.md`
- `ATLANTIS_UI_EXECUTION_BOARD.md`
- `atlantis/automation/transition_state.json`
- `src/renderer/js/ui/dashboard-ui.js`
- `src/renderer/js/core/orchestration-service.js`
- prior Phase 3/4 proof artifacts naming the deferred display bugs

## Confirmed Step 2 Targets
1. Owner Movement field bug
2. Phase label display bug

## Evidence Reviewed
Relevant findings:
- `src/renderer/js/ui/dashboard-ui.js:197`
  - renders `step.ownerNotification`
- `src/renderer/js/ui/dashboard-ui.js:279`
  - renders `phase.ownerNotification || project.automationRules?.notifications?.channel`
- `artifacts/supervisor-final-verdict-phase3-complete-20260319T140814CDT.md`
  - explicitly records Discord thread ID showing in Owner Movement field
  - explicitly records app phase label still showing stale phase text

## Suspected Root Cause
### Owner Movement field bug
The UI is using notification-channel/config values (`ownerNotification` / notifications channel) as if they were owner-movement semantics. That causes a Discord thread/channel identifier to appear in the Owner Movement card instead of a human-readable workflow movement state.

### Phase label display bug
The renderer has more than one phase source in play (`project.phase`, execution-state phase, registry baseline, orchestrator-trusted state). The displayed phase label is likely reading a stale/general project phase instead of the authoritative execution-state phase for the Atlantis workflow panel.

## Likely Affected Files
- `src/renderer/js/ui/dashboard-ui.js`
- possibly `src/renderer/js/core/orchestration-service.js`
- possibly `src/renderer/js/core/data-service.js` if execution-state normalization is needed

## Exact Implementation Target
Builder should next produce `DELTA_PROOF` that:
- replaces Owner Movement display with a workflow-movement/trusted execution value rather than a notification destination
- binds the workflow/open-project phase display to the authoritative execution-state phase where appropriate
- preserves notification-channel display only in notification-specific cards

## Decision
PASS

## Next Thing
Advance to Builder `DELTA_PROOF` for Phase 4 Step 2 and implement the UI fix in Atlantis app renderer surfaces.
