# Atlantis Phase 6 — Build Step 2 — BUILDER PLAN

- owner: BUILDER
- model: ollama/qwen3-next-coder:cloud
- scheme: PLAN
- result: PASS
- timestamp: 2026-03-25T210500-05:00
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

## Context

### Invalid Drift Notice

The prior Step 19+ artifact chain is **invalid drift** and must be ignored:

- **Phase 6 has only 6 authorized steps** (Per `docs/Atlantis-Phase6-BuildSpec.docx`)
- **Step 7 and above are unauthorized** - see `docs/ATLANTIS_PHASE6_AUDIT_2026-03-25.md`
- Artifacts `build-step7-*` through `build-step18-*` are preserved for forensics but do not drive status

### Current State Analysis

### Data Flow (Verified)

1. **mapOpenClawFeed()** in `data-service.js` already emits:
   - `id`, `name`, `model`, `status`, `kind`, `roles`, `tools`, `skills`

2. **renderAgentCard()** in `mission-ui.js` displays:
   - name ✓
   - model (or "Not set") ✓
   - health status badge ✓
   - kind label ("Agent" or "Sub-Agent") ✓
   - roles (via `agent.roles`) ✓
   - teams ✓

3. **Agent roster grid** renders cards with:
   - No blank cards when data is present (fallback to "No role set", "No team set")

### Files Analyzed

| File | Function | Status |
|------|----------|--------|
| `src/renderer/js/core/data-service.js` | `mapOpenClawFeed()` | Already maps all required fields |
| `src/renderer/js/ui/mission-ui.js` | `renderAgentCard()` | Renders name, model, health, kind, roles, teams |

### Why Step 19+ Chain is Invalid

The Phase 6 authorized scope is **exactly 6 steps** per `docs/Atlantis-Phase6-BuildSpec.docx`:

| Step | Objective |
|------|-----------|
| 1 | WebSocket data mapper |
| 2 | Agents tab live population |
| 3 | Project agent cards |
| 4 | Display fixes |
| 5 | Sync status accuracy |
| 6 | End-to-end live validation |

Artifacts Step 7+ are **invalid drift** and must not be treated as valid project progress.

### Current Status

Per `docs/ATLANTIS_STATUS.md`:
- **Status:** PHASE_6_AUDIT_HOLD
- **Procedural Artifact State:** Steps 1–6 have a complete-looking owner/scheme chain
- **Implementation Certification:** NOT YET CERTIFIED

## Plan

### Implementation Steps
1. Verify `mapOpenClawFeed()` emits all 6 required fields
2. Verify `renderAgentCard()` displays all fields correctly
3. Test live data produces zero blank cards
4. Document findings

### Acceptance Criteria
- [ ] `mapOpenClawFeed()` emits name, model, health, kind, tools, skills
- [ ] Agent cards render without blank fields
- [ ] Live data flow produces zero blank cards

## Status
PLAN complete. Proceeding to WORK for live data validation.
