# Orchestrator Artifact — NUDGE

- Phase: PHASE 4 — RELEASE & LEARN
- Step: Step 2
- Current Owner: BUILDER
- Active Scheme: EXECUTION_PROOF
- Enforcement: NUDGE
- Timestamp: 2026-03-20 15:36 CDT

## Why This Nudge Exists
The active scheme requires a Builder execution proof artifact, but none is registered yet for Phase 4 Step 2.

## Exact Missing Artifact
- `builder-execution-proof-phase4-step2-<timestamp>.md`

## Required Proof Content
Builder must provide runtime-backed confirmation that:
- Atlantis app renders corrected phase label from authoritative execution state
- Owner Movement no longer shows notification/thread/channel identifier values
- corrected values are visible in the running Atlantis UI

## Allowed Next Outcomes
- PASS: Builder submits execution proof artifact and workflow advances
- BLOCKED: Builder submits blocker artifact describing why runtime/UI validation cannot be performed safely
- STALLED: Orchestrator marks stalled if proof remains missing after SLA window

## Command Intent
Auto-run remains enabled. Orchestrator must continue nudging/enforcing movement and may not perform Builder implementation work itself.
