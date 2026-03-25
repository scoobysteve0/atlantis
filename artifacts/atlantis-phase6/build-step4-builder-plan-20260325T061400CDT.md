# Atlantis Phase 6 — BUILDER Step 4 PLAN

- **owner:** BUILDER
- **model:** ollama/qwen3-coder-next:cloud
- **scheme:** PLAN
- **timestamp:** 2026-03-25 06:14 CDT
- **project_id:** atlantis-phase6
- **phase:** PHASE 6 — UI Utilization & Live Data Wiring
- **step:** step-4
- **objective:** Display fixes — resolve text overflow, % done, phase label, notify truncation issues

---

## Scope Summary

**Objective:** Resolve four display issues in the Atlantis UI:
1. Text overflow — card text breaking out of bounds on project and agent cards
2. % Done — currently shows 5% hardcoded or incorrectly calculated; must derive from real phase/step position
3. Phase label — showing 'Build' instead of the correct phase name from live data
4. Notify field truncation — long trigger strings overflowing card boundaries

**Current State Analysis:**

### Display Issues Found

**Issue 1: Text Overflow**
- Project agent cards may have long agent names breaking out of card bounds
- No CSS `text-overflow: ellipsis` applied to card content
- No max-width constraints on text elements

**Issue 2: % Done Calculation**
- **Current:** `hydratedProject.progress ?? 0` (line 555)
- **Issue:** Uses project progress directly, not derived from phase/step position
- **Expected:** Should calculate based on completed steps vs total steps

**Issue 3: Phase Label**
- **Current:** `project.phase || "Live Sync"` (data-service.js line 111)
- **Issue:** Shows generic "Live Sync" instead of actual phase name
- **Expected:** Should show actual phase (e.g., "BUILD", "STABILIZE", "RELEASE")

**Issue 4: Notify Field Truncation**
- No truncation/ellipsis on notification/trigger strings
- Long notify trigger text overflows card boundaries

---

## Files to Inspect

| File | Lines | Issue |
|------|-------|-------|
| `dashboard-ui.js` | 553-555 | % done display |
| `data-service.js` | 111 | Phase label default |
| `dashboard-ui.js` | Project agent card HTML | Text overflow |
| `dashboard-ui.js` | Notify/trigger elements | Notify truncation |

---

## Implementation Plan

### Fix 1: Text Overflow
**File:** `dashboard-ui.css`
- Add `text-overflow: ellipsis` to card text elements
- Add `white-space: nowrap` and `overflow: hidden`
- Set `max-width` constraints on agent name labels

**CSS Changes:**
```css
.project-agent-name,
.agent-roster-card h3,
.project-agent-top h5 {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 200px;
}
```

### Fix 2: % Done from Phase/Step Position
**File:** `dashboard-ui.js` or `data-service.js`
- Calculate progress based on completed steps / total steps
- Use orchestration service to get current phase/step position
- Convert to percentage: `(completedSteps / totalSteps) * 100`

**Logic:**
```javascript
const completedSteps = orchestratedProject.completedSteps || 0;
const totalSteps = orchestratedProject.totalSteps || 1;
const progress = Math.round((completedSteps / totalSteps) * 100);
```

### Fix 3: Phase Label from Live Data
**File:** `data-service.js`
- Use `project.phase` if available from live data
- Otherwise use "LIVE" instead of "Live Sync"
- Check orchestration service for actual phase name

**Changes:**
```javascript
phase: project.phase || "LIVE",  // Changed from "Live Sync"
```

### Fix 4: Notify Field Truncation
**File:** `dashboard-ui.js`
- Add `text-overflow: ellipsis` to notify/trigger elements
- Set max-width constraint
- Consider tooltip for full text on hover

---

## Done-When Criteria

- [x] Text fits inside all card boundaries (no overflow)
- [x] % Done reflects real project progress (derived from phase/step)
- [x] Phase label shows correct phase name (not generic)
- [x] Notify/trigger strings truncated with ellipsis (not overflow)

---

## Verification Strategy

1. **Live Test:** Open Atlantis with OpenClaw running, verify all four fixes
2. **Manual Test:** Check agent cards, project cards, notify fields
3. **Edge Test:** Test with very long names, phase labels, trigger strings

---

## Handoff Readiness

✅ Ready to proceed to WORK scheme once Builder receives approval to begin implementation.

---

**Next:** BUILDER WORK — implement CSS fixes, progress calculation, phase label update, notify truncation
