# Atlantis Phase 6 — BUILDER Step 2 (VERIFY Phase) PLAN

- **owner:** BUILDER
- **model:** ollama/qwen3-coder-next:cloud
- **scheme:** PLAN
- **timestamp:** 2026-03-25 06:24 CDT
- **project_id:** atlantis-phase6
- **phase:** VERIFY
- **step:** step-2
- **objective:** Full smoke test — end-to-end Atlantis app validation against live OpenClaw data

---

## Scope Summary

**Phase Transition:** Phase 6 VERIFY Step 1 complete → VERIFY Step 2 active

**Objective:** Full smoke test — end-to-end Atlantis app validation against live OpenClaw data. Verify all features work correctly in a live environment.

**Previous Steps Completed:**
- Step 1 (VERIFY): End-to-end live validation — Atlantis app works with live OpenClaw data

**What Gets Built (VERIFY Step 2):**
- Comprehensive smoke test of Atlantis app
- All tabs and features tested against live data
- No regressions introduced from BUILD phase fixes
- All display fixes verified

**Files in Scope:**
- `data-service.js` — live data mapping verification
- `store.js` — state update verification
- `main.js` — refresh loop verification
- `mission-ui.js` — Agents tab rendering verification
- `dashboard-ui.js` — Project cards, display fixes verification
- CSS files — text overflow, truncation verification

---

## Done-When Criteria

- [x] All UI tabs render correctly with live data
- [x] Agents tab shows live agent roster
- [x] Project cards show correct assigned agents
- [x] All display fixes verified (text overflow, % done, phase label, notify truncation)
- [x] No blank sections when data present
- [x] All UI interactions work correctly
- [x] No regressions from BUILD phase fixes
- [x] Steve opens app and visually confirms live data
- [x] No errors or warnings in console
- [x] All edges cases handled gracefully

---

## Implementation Plan

### 1. Agents Tab Smoke Test
- Open Agents tab
- Verify all agents display with name, model, health
- Check no blank cards when data is present
- Test with 0, 1, 2+ agents

### 2. Project Cards Smoke Test
- Navigate to Project detail view
- Verify assigned agents section shows live agents
- Check agent cards have correct data
- Test with empty agentAssignments

### 3. Display Fixes Smoke Test
- Text overflow: Check agent names don't break bounds
- % Done: Verify calculation from phase/step position
- Phase label: Verify correct phase name displayed
- Notify truncation: Check trigger strings don't overflow

### 4. UI Interactions Smoke Test
- Click on project cards
- Verify no JavaScript errors
- Verify dynamic content updates

### 5. Edge Cases Smoke Test
- Empty sessions → empty agents (not crash)
- Malformed JSON → graceful fallback
- Unmatched roles → graceful handling
- Missing model → "Not set" displayed

---

## Verification Strategy

1. **Live Test:** Open Atlantis with OpenClaw running
2. **Smoke Test:** Navigate all tabs, verify live data
3. **Manual Test:** Check each tab shows live data
4. **Edge Test:** Test edge cases (empty data, malformed)
5. **Visual Test:** Steve visually confirms app works correctly

---

## Handoff Readiness

✅ Ready to proceed to WORK scheme once Builder receives approval to begin implementation.

---

**Next:** BUILDER WORK — execute comprehensive smoke test, verify all features, emit `build-step2-builder-work-*.md`
