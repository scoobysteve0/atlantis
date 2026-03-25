# Builder Artifact — DELTA_PROOF

- Phase: PHASE 3 — STABILIZE
- Step: Step 1
- Owner: BUILDER
- Scheme: DELTA_PROOF
- Timestamp: 2026-03-19 09:22:58 CDT

## What fault scenarios I will test
1. **Anchor down / OpenClaw unavailable**
   - Simulate failure to read live OpenClaw status/session data.
   - Verify Atlantis falls back to cached/mock/local desktop-readable sources instead of crashing.
2. **Stale data / stale registry state**
   - Simulate old status registry content or unchanged upstream payload timestamps.
   - Verify Atlantis surfaces stale/fallback state clearly and does not falsely present fresh/live state.
3. **Network timeout / fetch hang / non-200 responses**
   - Simulate timeout and endpoint failures on OpenClaw status/session fetch paths.
   - Verify retry/fallback behavior and visible degraded-state signaling.
4. **Bad payload / malformed JSON / missing fields**
   - Simulate invalid payload structure, parse failures, and partial objects.
   - Verify graceful degradation to defaults and no renderer breakage.

## Which files I will touch
- `src/renderer/js/core/data-service.js`
- `src/renderer/js/ui/dashboard-ui.js`
- `src/renderer/js/core/orchestration-service.js`
- `src/renderer/data.json`
- `artifacts/builder-execution-proof-phase3-step1-20260319T*.md`
- `artifacts/builder-acceptance-check-phase3-step1-20260319T*.md`
- `artifacts/builder-final-verdict-phase3-step1-20260319T*.md`

## Test plan
1. Read the current failure-handling code paths in `data-service.js`, `dashboard-ui.js`, and `orchestration-service.js`.
2. Identify whether current code already supports graceful fallback for:
   - fetch failures
   - malformed payloads
   - stale/old status inputs
   - unavailable Anchor/OpenClaw live bridge
3. If gaps exist, implement the minimum changes needed to preserve these guardrails:
   - Avatar remains read-only
   - Anchor remains the only OpenClaw-facing component
   - Visible fallback/source/status badges remain accurate
4. Run targeted fault-injection checks by forcing:
   - thrown fetch errors
   - timeout/non-200 responses
   - malformed payloads / missing fields
   - stale status doc / stale feed conditions
5. Capture actual outputs, diffs, and resulting UI/state behavior in EXECUTION_PROOF.
6. Self-assess whether all tested failure modes either passed or failed gracefully without unsafe or misleading behavior.

## Why this delta matters
Phase 3 / Step 1 requires fault injection and chaos testing. Atlantis must keep operating safely when the live Anchor/OpenClaw path is unavailable, stale, slow, or malformed, while clearly signaling fallback/degraded state to the user.
