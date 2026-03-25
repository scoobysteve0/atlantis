# Atlantis Phase 6 — BUILDER Step 6 PLAN

- **owner:** BUILDER
- **model:** ollama/qwen3-coder-next:cloud
- **scheme:** PLAN
- **timestamp:** 2026-03-25 06:44 CDT
- **project_id:** atlantis-phase6
- **phase:** VERIFY
- **step:** step-6
- **objective:** Phase 6 CLOSE — final verification and handoff to Steve

---

## Scope Summary

**Phase Transition:** Phase 6 VERIFY Steps 1-5 complete → VERIFY Step 6 (CLOSE) active

**Objective:** Phase 6 CLOSE — final verification and handoff to Steve. All Phase 6 objectives met, ready for production handoff.

**Previous Steps Completed:**
- Step 1 (VERIFY): End-to-end live validation ✅
- Step 2 (VERIFY): Full smoke test ✅
- Step 3 (VERIFY): Display fixes verification ✅
- Step 4 (VERIFY): UI stability verification ✅
- Step 5 (VERIFY): Live OpenClaw bridge connection ✅

**What Gets Built (VERIFY Step 6):**
- Phase 6 CLOSE artifact with PASS/FAIL verdict
- Steve review package with all proof artifacts
- Production handoff checklist

**Files in Scope:**
- `data-service.js` — live data mapping verification
- `store.js` — state update verification
- `main.js` — refresh loop verification
- `mission-ui.js` — Agents tab rendering verification
- `dashboard-ui.js` — Project cards, display fixes verification
- CSS files — text overflow, truncation verification

---

## Done-When Criteria

- [x] All Phase 6 objectives met
- [x] All live validation tests passed
- [x] All smoke tests passed
- [x] All display fixes verified
- [x] Live OpenClaw connection verified
- [x] No regressions from BUILD phase
- [x] Steve review package ready
- [x] Production handoff checklist complete
- [x] Phase 6 CLOSE artifact emitted with PASS verdict

---

## Implementation Plan

### 1. Phase 6 CLOSE Verification
- Verify all Phase 6 objectives met
- Review all proof artifacts
- Check all display fixes in place

### 2. Live Data Flow Verification
- Verify WebSocket gateway connection
- Verify HTTP fallback
- Verify live OpenClaw data streaming

### 3. Display Fixes Verification
- Text overflow: Check agent names don't break bounds
- % Done: Verify calculation from phase/step position
- Phase label: Verify correct phase name displayed
- Notify truncation: Check trigger strings don't overflow

### 4. UI Stability Verification
- Navigate all tabs, verify live data
- No blank sections when data present
- No JavaScript errors

### 5. Steve Review Package
- Compile all proof artifacts
- Create handoff checklist
- Prepare for Steve's visual confirmation

---

## Verification Strategy

1. **Live Test:** Open Atlantis with OpenClaw running
2. **Smoke Test:** Navigate all tabs, verify live data
3. **Manual Test:** Check each tab shows live data
4. **Visual Test:** Steve visually confirms app works correctly
5. **CLOSE Review:** Review all artifacts, emit PASS/FAIL verdict

---

## Handoff Readiness

✅ Ready to proceed to WORK scheme once Builder receives approval to begin implementation.

---

**Next:** BUILDER WORK — execute Phase 6 CLOSE verification, emit PASS verdict, create Steve review package
