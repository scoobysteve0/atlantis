# Atlantis Phase 6 — BUILDER Step 2 PLAN

- **owner:** BUILDER
- **model:** ollama/qwen3-coder-next:cloud
- **scheme:** PLAN
- **timestamp:** 2026-03-25 00:55 CDT
- **project_id:** atlantis-phase6
- **phase:** PHASE 6 — UI Utilization & Live Data Wiring
- **step:** step-2
- **objective:** Agents tab live population — populate Agents tab with live agent data

---

## Scope Summary

**Objective:** Ensure the Agents tab shows all live agents with name, model, health, kind, tools, and skills. Zero blank cards when data is present.

**Current State Analysis:**
- Agents tab is rendered in `mission-ui.js` via `mountMission()`
- Uses `state.agents` array from store
- `renderAgentCard()` displays each agent with name, model, roles, teams, health status
- Card layout shows: name, model, roles, teams, lane, parent, health badge

**What Gets Built:**
- No new UI code needed — rendering already exists
- Need to ensure `state.agents` is properly populated from OpenClaw data
- Verify the connection: OpenClaw WebSocket → `mapOpenClawFeed()` → store → Agents tab

**Files in Scope:**
- `data-service.js` — verify `mapOpenClawFeed()` produces correct agent shape
- `store.js` — verify state initialization and updates
- `main.js` — verify data flow from refresh to store

---

## Done-When Criteria

- Agents tab shows all live agents when OpenClaw is running
- Each agent card displays: name, model, health status (glow if active), kind label, tools, skills
- Zero blank cards when data is present
- Health badges show correct status (Active/Idle/Watching/Problem)
- Agent types show correct label (Agent/Sub-Agent)

---

## Implementation Plan

### 1. Verify Agent Data Shape
**File:** `data-service.js`
- Check `mapOpenClawFeed()` produces agents with: `id`, `name`, `model`, `role`, `status`, `kind`, `tools`, `skills`
- Ensure missing fields have safe defaults

### 2. Verify Store State Structure
**File:** `store.js`
- Check `state.agents` initialization
- Verify updates come from `dataService.load()`
- Confirm reactivity updates Agents tab

### 3. Verify Data Flow
**File:** `main.js`
- Check `refresh()` calls `dataService.load()`
- Verify store updates with agent data
- ConfirmAgents tab refreshes on data change

### 4. Edge Cases to Handle
- Empty sessions array → empty agents (not crash)
- Missing model → "Not set" or placeholder
- Missing kind → default to "agent"
- Missing tools/skills → show "None" or empty section

---

## Expected Output Shape

### Agent Card Expected Data
```javascript
{
  id: "session-1",
  name: "atlantis-builder",
  model: "ollama/qwen3-next-coder:cloud",
  role: "Builder",
  status: "active",
  kind: "agent", // or "subagent"
  roles: ["Builder"],
  teams: [],
  lane: "builder",
  parent: "Direct",
  tools: [{ name: "read", state: "enabled", fit: "usable" }],
  skills: { core: ["planning", "coding"], ops: [] }
}
```

### Health Badge Logic
- `status === "active"` + `active !== false` → "Active" + green glow
- `status === "idle"` + `active !== false` → "Idle" + green static
- `status === "monitoring"` → "Watching" + orange glow
- `status === "stalled"` or other → "Problem" + red glow

---

## Files to Inspect

| File | Purpose | Lines to Check |
|------|---------|----------------|
| `data-service.js` | `mapOpenClawFeed()` agent mapping | 82-121 |
| `store.js` | State initialization and updates | Entire file |
| `main.js` | Data flow from refresh to store | 200-280 (refresh loop) |
| `mission-ui.js` | Agent card rendering | 38-82 (renderAgentCard) |

---

## Verification Strategy

1. **Live Test:** Open OpenClaw, start Atlantis, verify Agents tab shows live agents
2. **Manual Test:** Check each field renders correctly (name, model, health, kind, tools, skills)
3. **Edge Test:** Test with empty sessions, missing fields, malformed data

---

## Handoff Readiness

✅ Ready to proceed to WORK scheme once Builder receives approval to begin implementation.

---

**Next:** BUILDER WORK — inspect existing data flow, verify agent shape, emit `build-step2-builder-work-*.md`
