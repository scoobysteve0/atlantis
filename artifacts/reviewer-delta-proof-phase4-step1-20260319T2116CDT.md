# Reviewer Artifact — DELTA_PROOF

- Phase: PHASE 4 — RELEASE & LEARN
- Step: Step 1
- Step Objective: Replace broken REST-style OpenClaw polling with real OpenClaw WebSocket RPC client integration
- Owner: REVIEWER
- Owner Model: openai-codex/gpt-5.4
- Scheme: DELTA_PROOF
- Validation Result: PASS
- Timestamp: 2026-03-19 21:16 CDT

## Summary
The current Atlantis app live-feed path is broken because it still tries to read OpenClaw status/session data through HTTP JSON endpoints that do not exist for this data plane. OpenClaw status/session data is delivered over the gateway WebSocket RPC interface, not the REST paths currently hard-coded in the renderer data service.

## Concrete Proof
File reviewed:
- `src/renderer/js/core/data-service.js`

Observed broken endpoint assumptions:
- `/api/status`
- `/status`
- `/session_status`
- `/api/sessions`
- `/sessions`
- `/session/list`

Observed app symptom from live run:
- `Saved. Data source: mock-json · Live feed unavailable. Using mock data.`
- attempts include:
  - `status /api/status: http://127.0.0.1:18789/api/status (404)`
  - `status http://127.0.0.1:18789/status returned malformed JSON`
  - `status /session_status: http://127.0.0.1:18789/session_status returned malformed JSON`

## Delta Decision
Phase 4 Step 1 is redefined from "probe guessed HTTP JSON paths" to the actual required build task:
- implement a real OpenClaw gateway WebSocket client in `src/renderer/js/core/data-service.js`
- subscribe/request status and session data over gateway RPC
- stop treating web UI routes or guessed REST paths as the live data source
- keep mock/cached fallback only as degraded evidence surface

## Why This Is Correct
OpenClaw status/session data is exposed through the gateway protocol used by the control UI and clients, not through the dead HTTP status/session paths Atlantis is currently probing. Therefore this is a build/integration bug, not a config mismatch.

## Next Thing
Builder must implement the WebSocket RPC integration in `data-service.js`, then prove live data flow without mock fallback.
