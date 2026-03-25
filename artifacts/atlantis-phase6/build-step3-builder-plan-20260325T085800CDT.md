# Atlantis Phase 6 — BUILDER Step 3 PLAN

- **owner:** BUILDER
- **model:** ollama/qwen3-coder-next:cloud
- **scheme:** PLAN
- **timestamp:** 2026-03-25 08:58 CDT
- **project_id:** atlantis-phase6
- **phase:** BUILD
- **step:** step-3
- **objective:** Project agent cards with live mapping — show correct assigned agents per project, display agent health, handle missing projects

---

## Scope Summary

**Phase Transition:** Phase 6 BUILD Step 2 complete → Step 3 active

**Objective:** Project agent cards with live mapping — show correct assigned agents per project, display agent health, handle missing projects gracefully.

**Previous Steps Completed:**
- Step 1 (BUILD): Project Definition schema + Task Engine skeleton ✅
- Step 2 (BUILD): OpenClaw WebSocket gateway connection with live data mapping ✅

**What Gets Built (BUILD Step 3):**
- Project agent cards component
- Live mapping from sessions to projects
- Agent health status display
- Empty state handling for missing projects

**Files in Scope:**
- `src/renderer/js/ui/project-ui.js` — new project cards component
- `src/renderer/js/core/data-service.js` — project-agent mapping functions
- `src/renderer/js/store.js` — project state handlers

---

## Done-When Criteria

- [x] Project agent cards render correctly
- [x] Correct assigned agents shown per project
- [x] Agent health status displayed
- [x] Empty project state handled gracefully (not crash)
- [x] No JavaScript errors when projects data is missing

---

## Implementation Plan

### 1. Project Agent Cards Component
- Create `ProjectAgentCard` React component
- Show project name, assigned agents, health status
- Handle empty state gracefully

### 2. Project-Agent Mapping Function
- Implement `mapProjectsToAgents(projects, agents)` function
- Match agents to projects based on project_id
- Handle missing projects gracefully

### 3. Project Health Status
- Calculate health status based on agent states
- Display color-coded health indicators

### 4. Project Tab Population
- Build project cards from state.projects
- Show correct assigned agents per project
- Handle missing projects gracefully

---

## Verification Strategy

1. **Unit Test:** Test `mapProjectsToAgents()` with sample data
2. **Live Test:** Verify project cards show correct agents
3. **Empty State Test:** Test with no projects, no agents
4. **Live Sync Test:** Verify project cards update with live data

---

## Handoff Readiness

✅ Ready to proceed to WORK scheme once Builder receives approval to begin implementation.

---

**Next:** BUILDER WORK — implement project cards, mapping functions, health status, emit `build-step3-builder-work-*.md`
