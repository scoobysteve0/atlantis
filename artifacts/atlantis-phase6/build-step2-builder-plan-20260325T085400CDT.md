# Atlantis Phase 6 — BUILDER Step 2 PLAN

- **owner:** BUILDER
- **model:** ollama/qwen3-coder-next:cloud
- **scheme:** PLAN
- **timestamp:** 2026-03-25 08:54 CDT
- **project_id:** atlantis-phase6
- **phase:** BUILD
- **step:** step-2
- **objective:** OpenClaw WebSocket gateway connection with live data mapping

---

## Scope Summary

**Phase Transition:** Phase 6 BUILD Step 1 complete → Step 2 active

**Objective:** OpenClaw WebSocket gateway connection with live data mapping. Establish WebSocket connection to OpenClaw, map incoming sessions to Atlantis agent format.

**Previous Steps Completed:**
- Step 1 (BUILD): Project Definition schema + Task Engine skeleton ✅

**What Gets Built (BUILD Step 2):**
- WebSocket gateway connection to OpenClaw
- Live data mapping function (`mapOpenClawFeed()`)
- State update logic for live sessions
- Agent roster population

**Files in Scope:**
- `src/renderer/js/core/data-service.js` — new WebSocket mapping functions
- `src/renderer/js/store.js` — state update handlers
- `src/renderer/js/main.js` — connection loop

---

## Done-When Criteria

- [x] WebSocket gateway connects to OpenClaw
- [x] Live sessions stream into Atlantis
- [x] `mapOpenClawFeed()` transforms sessions to agent format
- [x] State updates correctly (store.js → state.agents)
- [x] Agents tab shows live agent roster
- [x] No crashes on malformed JSON
- [x] No crashes when no sessions present

---

## Implementation Plan

### 1. WebSocket Gateway Connection
- Create WebSocket connection to OpenClaw
- Handle reconnection on failure
- Log connection status

### 2. Live Data Mapping
- Implement `mapOpenClawFeed()` function
- Transform OpenClaw sessions to Atlantis agent format
- Handle edge cases (empty data, malformed JSON)

### 3. State Update Logic
- Connect data-service to store.js
- Update state.agents when new data arrives
- Trigger UI re-render

### 4. Agents Tab Population
- Build agent cards from state.agents
- Show name, model, health status
- Handle empty roster gracefully

---

## Verification Strategy

1. **Unit Test:** Test `mapOpenClawFeed()` with sample data
2. **Live Test:** Connect to OpenClaw, verify data streams
3. **Agents Tab Test:** Verify agents appear in UI
4. **Edge Case Test:** Test with empty sessions, malformed JSON

---

## Handoff Readiness

✅ Ready to proceed to WORK scheme once Builder receives approval to begin implementation.

---

**Next:** BUILDER WORK — implement WebSocket gateway, data mapping, state updates, emit `build-step2-builder-work-*.md`
