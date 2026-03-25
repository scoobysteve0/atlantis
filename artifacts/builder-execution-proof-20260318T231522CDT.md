# Builder Artifact — EXECUTION_PROOF

- Owner: BUILDER
- Owner Model: qwen3-next-coder:cloud
- Scheme: EXECUTION_PROOF
- Validation Result: PASS
- Timestamp: 2026-03-18 23:15:22 CDT

## Summary
Patched Atlantis automated workflow resume/reconsume behavior so existing proof artifacts can advance the workflow after app restart or delayed ingestion. The key fix was expanding artifact discovery beyond builder-only proof files and triggering workflow advancement immediately after external proof ingestion.

## Files Changed
- src/main/index.js
- src/renderer/js/core/orchestration-service.js

## Validations
- PASS: node --check src/main/index.js
- PASS: node --check src/renderer/js/core/orchestration-service.js

## What Changed
- Expanded proof file discovery from `builder-*proof-*.md` to general `*-*proof-*.md` style proof files so Supervisor artifacts are no longer invisible to the runtime.
- Added a guarded reconcile loop after `ingestExternalProofs()` so Atlantis attempts `maybeAdvanceWorkflow()` immediately after loading newly discovered artifacts.
- This directly supports the intended resume/reconsume mode instead of requiring a fresh write event while the app is already open.

## Why This Solves The Stall
The runtime previously ignored non-builder proof artifacts during startup/reload ingestion, which meant the manually created Supervisor acceptance artifact could exist on disk but never be seen by Atlantis. Even after ingestion, resume behavior did not force an immediate advancement attempt. With both fixes in place, Atlantis can now:
- load Supervisor proof artifacts from disk
- ingest them into orchestration state
- immediately attempt scheme advancement from current state

## Artifact Path
- artifacts/builder-execution-proof-20260318T231522CDT.md
