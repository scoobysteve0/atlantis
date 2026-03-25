# Atlantis Phase 6 — Build Step 2 — BUILDER PLAN

- owner: BUILDER
- model: ollama/qwen3-coder-next:cloud
- scheme: PLAN
- result: PASS
- timestamp: 2026-03-25T210000-05:00
- project_id: atlantis-phase6
- phase: BUILD
- step: step-2
- objective: Agents tab live population — populate Agents tab with live agent data

## Objective

Agents tab shows all live agents with:
- name
- model
- health status
- kind label
- tools
- skills
Zero blank cards when data is present.

## Plan

### Implementation Steps
1. Verify `mapOpenClawFeed()` in `data-service.js` emits `model`, `kind`, `tools`, `skills`
2. Verify `mission-ui.js` renders all agent properties correctly
3. Verify `store.js` normalizes agents from payload
4. Verify live data flow produces zero blank cards

### Files to Analyze
- `src/renderer/js/core/data-service.js` - `mapOpenClawFeed()` function
- `src/renderer/js/ui/mission-ui.js` - Agent card rendering
- `src/renderer/js/core/store.js` - `normalizeData()` function

### Acceptance Criteria
- [ ] `mapOpenClawFeed()` emits all 6 required fields
- [ ] Agent cards render without blank fields
- [ ] Live data produces zero blank cards

## Status
PLAN complete. Proceeding to WORK for implementation.
