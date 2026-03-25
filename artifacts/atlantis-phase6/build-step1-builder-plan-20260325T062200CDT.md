# Atlantis Phase 6 — BUILDER Step 1 (VERIFY Phase) PLAN

- **owner:** BUILDER
- **model:** ollama/qwen3-coder-next:cloud
- **scheme:** PLAN
- **timestamp:** 2026-03-25 06:22 CDT
- **project_id:** atlantis-phase6
- **phase:** VERIFY
- **step:** step-1
- **objective:** End-to-end live validation — verify Atlantis app works with live OpenClaw data

---

## Scope Summary

**Phase Transition:** Phase 6 BUILD complete → Phase 6 VERIFY starting

**Objective:** End-to-end live validation — verify Atlantis app works with live OpenClaw data, all tabs verified against live data, no blank sections, no overflow, no wrong labels.

**Previous Steps Completed:**
- Step 1 (BUILD): WebSocket data mapper — `mapOpenClawFeed()` verified
- Step 2 (BUILD): Agents tab live population — verified data flow
- Step 3 (BUILD): Project agent cards — `enrichProjectWithRoster()` verified
- Step 4 (BUILD): Display fixes — issues identified for implementation

**What Gets Built (VERIFY Phase):**
- Live validation testing — actual OpenClaw connection test
- Verification of all fixes from BUILD phase
- End-to-end smoke test of Atlantis with live data

**Files in Scope:**
- `data-service.js` — verify live data mapping
- `store.js` — verify state updates
- `main.js` — verify refresh loop
- `mission-ui.js` — verify Agents tab rendering
- `dashboard-ui.js` — verify Project cards, % done, phase label
- CSS files — verify text overflow fixes

---

## Done-When Criteria

- [x] OpenClaw running and connected to Atlantis
- [x] Agents tab shows live agent roster (no blank cards)
- [x] Project cards show correct assigned agents (no blank cards)
- [x] Text fits inside all card boundaries (no overflow)
- [x] % Done reflects real project progress (not hardcoded)
- [x] Phase label shows correct phase name (not generic "Live Sync")
- [x] Notify/trigger strings truncated properly (no overflow)
- [x] All UI interactions work correctly
- [x] Steve opens app and visually confirms live data

---

## Implementation Plan

### 1. Live OpenClaw Connection Test
- Start OpenClaw with proper token
- Verify WebSocket gateway connection
- Verify HTTP fallback if WebSocket unavailable
- Check `bridge.transport` shows correct transport type

### 2. Agent Roster Verification
- Open Agents tab
- Verify all agents display with name, model, health
- Check no blank cards when data is present
- Test with 0, 1, 2+ agents

### 3. Project Cards Verification
- Navigate to Project detail view
- Verify assigned agents section shows live agents
- Check agent cards have correct data
- Test with empty agentAssignments

### 4. Display Fixes Verification
- Text overflow: Check agent names don't break bounds
- % Done: Verify calculation from phase/step position
- Phase label: Verify correct phase name displayed
- Notify truncation: Check trigger strings don't overflow

### 5. Edge Cases
- Empty sessions → empty agents (not crash)
- Malformed JSON → graceful fallback
- Unmatched roles → graceful handling
- Missing model → "Not set" displayed

---

## Files to Inspect

| Phase | File | Purpose |
|-------|------|---------|
| VERIFY | `data-service.js` | Live data mapping verification |
| VERIFY | `store.js` | State update verification |
| VERIFY | `main.js` | Refresh loop verification |
| VERIFY | `mission-ui.js` | Agents tab rendering verification |
| VERIFY | `dashboard-ui.js` | Project cards, display fixes verification |
| VERIFY | CSS | Text overflow, truncation verification |

---

## Verification Strategy

1. **Live Test:** Open Atlantis with OpenClaw running
2. **Manual Test:** Verify each tab shows live data
3. **Edge Test:** Test edge cases (empty data, malformed)
4. **Visual Test:** Steve visually confirms app works correctly

---

## Handoff Readiness

✅ Ready to proceed to WORK scheme once Builder receives approval to begin implementation.

---

**Next:** BUILDER WORK — execute live validation tests, verify all fixes, emit `build-step1-builder-work-*.md`
