# Atlantis Standard Flow Alignment Proof

## Objective
Move Atlantis project execution forward using the canonical Atlantis automation flow instead of nonstandard scheme names.

## Changed file
- `src/renderer/data.json`

## Real work completed
- Replaced nonstandard project scheme labels with the canonical Atlantis workflow stages:
  - BUILD
  - SUPERVISE
  - AUDIT
  - FINAL SUPERVISE
- Updated the Atlantis project `activeScheme` to `BUILD`.
- Aligned automation rules with the Atlantis contracts:
  - proof-based continuous execution mode
  - explicit human approval required for phase advancement
  - STEP_STARTED / STEP_COMPLETED handoff signaling
  - 10m stalled / 15m escalated watchdog behavior
- Updated workflow step `scheme` labels so Step 1..4 now map to the standard automation flow.
- Updated done-when language to reflect the real Atlantis control/execution contract.

## Validation
- `node --check src/renderer/js/ui/dashboard-ui.js`
- JSON reload check via `python3` parsing of `src/renderer/data.json`

## Expected visible result
In the Atlantis project open view:
- scheme chips reflect BUILD / SUPERVISE / AUDIT / FINAL SUPERVISE
- active scheme shows BUILD
- automation rules describe proof-based execution + approval gate
- workflow steps use the canonical Atlantis standard instead of Architecture / Integration / Persistence / Hardening scheme labels
