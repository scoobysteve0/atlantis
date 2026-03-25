# Atlantis Phase 6 — BUILDER Step 1 PLAN

- **owner:** BUILDER
- **model:** ollama/qwen3-coder-next:cloud
- **scheme:** PLAN
- **timestamp:** 2026-03-24 22:47 CDT
- **project_id:** atlantis-phase6
- **phase:** PHASE 6 — UI Utilization & Live Data Wiring
- **step:** step-1
- **objective:** WebSocket data mapper — connect OpenClaw messages to UI data shapes

---

## Scope Summary

Phase 6目标 is to wire live OpenClaw data into the Atlantis app UI. Phase 5 completed the WebSocket bridge; Step 1 begins the data connection by implementing the message mapper.

**What gets built:** The WebSocket data mapper in `data-service.js` that translates OpenClaw WebSocket payloads into the UI's expected shape (`agents[]`, `projects[]`, `sessions[]`).

**Files in scope:**
- `src/data-service.js` — primary target for Step 1

**Out of scope (Phase 7):** Discord channel integrations, trading data, new UI features.

---

## Done-When Criteria

- `data-service.js` contains a `mapWebSocketMessage()` function that correctly parses OpenClaw message payloads
- The function produces objects matching the expected shape: `agents[]`, `projects[]`, `sessions[]`
- Missing or partial fields are handled gracefully (no crashes)
- Test suite passes with live OpenClaw messages

---

## Implementation Plan

### 1. Read existing `data-service.js`
- Identify current message handling skeleton
- Document expected input/output shapes

### 2. Add `mapWebSocketMessage(message)` function
- Parse `message.type` to route to appropriate mapper
- Map each OpenClaw field to the corresponding UI shape field
- Handle null/undefined fields with safe defaults

### 3. Implement type-specific mappers
- `mapAgent(agentRaw)` → UI agent object
- `mapProject(projectRaw)` → UI project object
- `mapSession(sessionRaw)` → UI session object

### 4. Add error handling
- Catch mapping failures without crashing
- Log warnings with message ID for debugging

### 5. Create test fixtures
- Sample OpenClaw messages (real or realistic)
- Expected output objects
- Test assertions for each mapper

---

## Expected Output Shape

### agents[]
```javascript
{
  name: string,
  model: string,
  status: "active" | "idle" | "stalled",
  kind: "agent" | "subagent",
  roles: string[],
  tools: string[],
  skills: { [name]: string }
}
```

### projects[]
```javascript
{
  id: string,
  name: string,
  status: string,
  phase: string,
  progress: number,
  agentAssignments: string[]
}
```

### sessions[]
```javascript
{
  id: string,
  agent: string,
  status: string,
  label: string
}
```

---

## Proof Artifacts (Subsequent Steps)

- **WORK:** Code diff showing `mapWebSocketMessage()` function and all helper mappers added to `data-service.js`
- **VERIFY:** Test results, live app confirmation with OpenClaw running, screenshot of Agents tab populated
- **Acceptance:** All Done-When criteria met, no regressions in other tabs

---

## Handoff Readiness

✅ Ready to proceed to WORK scheme once Builder receives approval to begin implementation.

---

**Next:** BUILDER WORK — implement the mapper, produce code diff, emit `build-step1-builder-work-*.md`
