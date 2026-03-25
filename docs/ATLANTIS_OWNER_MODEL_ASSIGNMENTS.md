# ATLANTIS OWNER MODEL ASSIGNMENTS

These owner-model assignments are locked for the current Atlantis project unless Commander explicitly changes them.

## Locked assignments

- Builder: `ollama/qwen3-next-coder:cloud`
- Reviewer: `google/gemini-3.1-pro-preview`
- Auditor: `grok-4-fast-reasoning`
- Supervisor: `gpt-5.3-codex`

## Authority note

Commander states these were established at initial project kickoff and have not changed.
Any status, heartbeat, or handoff flow that implies otherwise should be treated as inaccurate unless supported by an explicit Commander-approved reassignment.

## Usage rule

When reporting Atlantis status and the active owner matters, use the locked model assignment if that owner's model identity is relevant to the update.

## Execution binding authority

Canonical runtime binding file:
- `config/owner-bindings.json`

Binding scope:
- enforce the documented locked roles: Builder, Reviewer, Auditor, Supervisor
- do not treat Main as an implementation owner
- do not invent additional locked permanent owner bindings beyond what the documents establish

Binding rules:
- Main is orchestrator-only and must not perform Builder, Reviewer, Auditor, or Supervisor implementation work.
- Builder, Reviewer, Auditor, and Supervisor must bind to real execution sessions, not just status text.
- A documented locked role may be marked ACTIVE only if its bound session exists, the bound model matches, and the expected artifact path is declared.
- If any of those checks fail, Atlantis should report `BLOCKED` with `owner_binding_failure`, not pretend the owner is active.

## Canonical owner → agent binding

These bindings are the current runtime truth and should be used by dispatch, heartbeat, handoff, and status flows:

- Builder → `atlantis-builder` → session key pattern `agent:atlantis-builder:*` → model `ollama/qwen3-coder-next:cloud`
- Reviewer → `atlantis-reviewer` → session key pattern `agent:atlantis-reviewer:*` → model `google/gemini-3.1-pro-preview`
- Auditor → `atlantis-auditor` → session key pattern `agent:atlantis-auditor:*` → model `grok-4-fast-reasoning`
- Supervisor → `atlantis-supervisor` if present, otherwise the explicitly assigned supervisor execution session using model `gpt-5.3-codex`

Dispatch rule:
- When Atlantis says `BUILDER` is active, dispatch directly to the dedicated `atlantis-builder` agent. Do not silently remap Builder work to Main or Operator.

## Current importance

This matters especially for:
- handoffs
- reset decisions
- audit trust questions
- reviewer/auditor/supervisor continuity
