# Atlantis Phase 6 — Step 2 — BUILDER PLAN

- Phase: 6 — UI Utilization & Live Data Wiring
- Step: 2
- Owner: BUILDER
- Model: `ollama/qwen3-next-coder:cloud`
- Scheme: PLAN
- Timestamp: 2026-03-25 14:27:25 CDT
- Status: STARTED

## Objective

Agents tab live population.

## Done-When

The Agents tab shows all live agents with:
- name
- model
- health status
- kind label
- tools
- skills

And there are zero blank agent cards when live data is present.

## Authoritative references reviewed

1. `atlantis-electron/docs/Atlantis-Phase6-BuildSpec.docx`
2. `atlantis-electron/docs/ATLANTIS_PHASE6_AUDIT_2026-03-25.md`
3. `atlantis-electron/docs/ATLANTIS_STATUS.md`
4. `atlantis-electron/docs/ATLANTIS_OWNER_MODEL_ASSIGNMENTS.md`

## Context

- Step 1 was corrected in `src/renderer/js/core/data-service.js` to map:
  - `agents[]`
  - `projects[]`
  - `sessions[]`
- Prior Step 7+ / Step 19+ chains are invalid drift and are ignored for current project truth.
- Current authorized target is Step 2 only.

## Files in scope for Step 2

Primary implementation targets:
- `atlantis-electron/src/renderer/js/ui/mission-ui.js`
- `atlantis-electron/src/renderer/js/core/store.js`
- `atlantis-electron/src/renderer/js/main.js`

Dependency context:
- `atlantis-electron/src/renderer/js/core/data-service.js`

## Build plan

1. Verify the Agents tab is reading from `state.agents` populated by the corrected Step 1 mapper.
2. Ensure `renderAgentCard()` reliably renders:
   - `agent.name`
   - `agent.model`
   - health state from `agent.status`
   - kind label from `agent.kind`
   - tools from `agent.tools`
   - skills from `agent.skills`
3. Eliminate any remaining blank-card conditions when `state.agents` contains live data.
4. Keep Step 2 scope isolated; do not drift into Step 3 project-card work or later steps.

## Expected implementation proof

The Step 2 WORK artifact must include:
- exact file path(s) modified
- specific rendering/state change made
- why the change fixes blank or incomplete agent cards
- evidence that live agent fields are wired through to the Agents tab

## Orchestrator note

This PLAN artifact was emitted to unblock execution and re-anchor the Builder on the corrected six-step Phase 6 truth.
