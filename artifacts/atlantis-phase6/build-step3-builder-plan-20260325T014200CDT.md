# Atlantis Phase 6 — BUILDER Step 3 PLAN

- **owner:** BUILDER
- **model:** ollama/qwen3-coder-next:cloud
- **scheme:** PLAN
- **timestamp:** 2026-03-25 01:42 CDT
- **project_id:** atlantis-phase6
- **phase:** PHASE 6 — UI Utilization & Live Data Wiring
- **step:** step-3
- **objective:** Project agent cards — verify project detail view shows correct assigned agents

---

## Scope Summary

**Objective:** Project detail view has an "Assigned Agents" section with agent cards. These pull from `state.agents` via `enrichProjectWithRoster()`. The cards should be populated when live agent data is available.

**Current State Analysis:**
- `enrichProjectWithRoster(project, agents)` function exists in `dashboard-ui.js` (lines 123-175)
- Projects have `agentAssignments[]` array with `role` field
- Function matches assignments to `state.agents` by role → returns `agent`, `health` fields
- Project detail view (lines 587) renders `projectAgents` from the enriched assignments

**What Gets Built:**
- No new UI code needed — rendering already exists
- Verify `enrichProjectWithRoster()` correctly matches assignments to agents
- Verify project detail view shows correct assigned agents when data is present

**Files in Scope:**
- `dashboard-ui.js` — `enrichProjectWithRoster()`, project detail rendering
- `store.js` — verify `state.agents` population (Step 2 already verified)
- `data-service.js` — verify `mapOpenClawFeed()` produces correct project agentAssignments

---

## Done-When Criteria

- Project detail view shows all assigned agents from `state.agents` roster
- Each assigned agent card displays: name, model, health status
- Cards are populated when live agent data is present
- No blank cards when data is present

---

## Implementation Plan

### 1. Verify enrichProjectWithRoster Logic
**File:** `dashboard-ui.js` (lines 123-175)
- Check role → agent matching logic
- Verify fallback handling when no match found
- Confirm `agent` and `health` fields are correctly populated

### 2. Verify Project Data Shape
**File:** `data-service.js`
- Check if projects have `agentAssignments[]` array
- Verify `role` field matches agent `role` field

### 3. Verify UI Rendering
**File:** `dashboard-ui.js` (lines 587-590)
- Verify `projectAgents` is rendered from `hydratedProject.agentAssignments`
- Check empty state fallback when no agents assigned

### 4. Edge Cases to Handle
- Empty `agentAssignments` → show "No agents assigned"
- Unmatched role → show assignment with "Unassigned" health
- Missing `model` on agent → fallback to "Not set"

---

## Expected Output Shape

### Enriched Project Agent Assignment
```javascript
{
  role: "Builder",
  agent: "atlantis-builder / ollama/qwen3-next-coder:cloud",
  health: "active"
}
```

### Project Detail View Agent Card
```html
<article class="project-agent-card">
  <div class="project-agent-top">
    <h5>atlantis-builder</h5>
    <span class="health-pill status-green-glow">Active</span>
  </div>
  <span class="project-agent-name">ollama/qwen3-next-coder:cloud</span>
</article>
```

---

## Files to Inspect

| File | Function | Purpose | Lines |
|------|----------|---------|-------|
| `dashboard-ui.js` | `enrichProjectWithRoster()` | Matches agentAssignments to state.agents | 123-175 |
| `dashboard-ui.js` | Project detail rendering | Renders assigned agents | 587-590 |
| `data-service.js` | `mapOpenClawFeed()` | Produces projects with agentAssignments | 82-121 |

---

## Verification Strategy

1. **Live Test:** Open Atlantis, verify Project detail view shows assigned agents
2. **Manual Test:** Check each agent card renders correctly (name, model, health)
3. **Edge Test:** Test with empty agentAssignments, unmatched roles

---

## Handoff Readiness

✅ Ready to proceed to WORK scheme once Builder receives approval to begin implementation.

---

**Next:** BUILDER WORK — inspect enrichProjectWithRoster logic, verify data flow, emit `build-step3-builder-work-*.md`
