# Phase 4 Step 1 Redefinition — WebSocket RPC Integration Required

- Phase: PHASE 4 — RELEASE & LEARN
- Step: Step 1
- Timestamp: 2026-03-19 21:17 CDT
- Authority: Main / Atlantis Orchestrator continuity overlay

## Redefinition
Phase 4 Step 1 is not a config tweak and not an app-status interpretation problem.
It is a full build task:

**Implement OpenClaw gateway WebSocket RPC integration in `src/renderer/js/core/data-service.js` for live status and session data.**

## Replace This Broken Behavior
Current code probes guessed HTTP JSON paths:
- `/api/status`
- `/status`
- `/session_status`
- `/api/sessions`
- `/sessions`
- `/session/list`

That behavior is invalid for the actual OpenClaw data plane and causes Atlantis to fall back to mock JSON.

## Required Outcome
- Atlantis connects to OpenClaw gateway over WebSocket
- status/session data is requested or subscribed through gateway RPC
- app stops depending on non-existent REST endpoints for this feature
- mock/cached data remains fallback only
- visible source badge reports true live-vs-fallback state

## Workflow Meaning
This confirms the live-feed failure is a real product bug and keeps Phase 4 Step 1 in scope as the correct integration task.

## Stand-down
No more work required tonight beyond documenting the real task and preserving canonical workflow state.
