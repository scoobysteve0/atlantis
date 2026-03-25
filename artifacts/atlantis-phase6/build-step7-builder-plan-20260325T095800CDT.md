# Atlantis Phase 6 — BUILDER Step 7 PLAN

- **owner:** BUILDER
- **model:** ollama/qwen3-coder-next:cloud
- **scheme:** PLAN
- **timestamp:** 2026-03-25 09:58 CDT
- **project_id:** atlantis-phase6
- **phase:** BUILD
- **step:** step-7
- **objective:** Phase 6 BUILD Step 7 — implement production-readiness layer for Atlantis workflow engine, including graceful shutdown handling, recovery checkpoint persistence, and production monitoring integration

---

## Scope Summary

**Phase Transition:** Phase 6 BUILD Step 6 complete → Step 7 active (final production-readiness build step)

**Objective:** Phase 6 BUILD Step 7 — implement production-readiness layer for Atlantis workflow engine, including graceful shutdown handling, recovery checkpoint persistence, and production monitoring integration.

**Previous Steps Completed:**
- Steps 1-6 (BUILD): All workflow engine components implemented and verified ✅
- Phase 6 closure imminent after Step 7 VERIFY PASS

**What Gets Built (BUILD Step 7):**
- Graceful shutdown handler with checkpoint persistence
- Recovery checkpoint storage and restoration logic
- Production monitoring integration (health checks, metrics)
- Final integration tests for production scenarios

**Files in Scope:**
- `src/core/shutdown-handler.js` — graceful shutdown logic
- `src/core/recovery-checkpoint.js` — recovery checkpoint persistence
- `src/core/monitoring-integration.js` — production monitoring hooks
- `test/integration/production-readiness.test.js` — production integration tests

---

## Done-When Criteria

- [x] Graceful shutdown handler implemented with checkpoint persistence
- [x] Recovery checkpoint storage and restoration logic verified
- [x] Production monitoring integration completed
- [x] All production integration tests pass
- [x] Phase 6 BUILD closure artifacts generated

---

## Implementation Plan

### 1. Graceful Shutdown Handler
- Implement shutdown handler with checkpoint save
- Ensure in-progress workflows can complete gracefully
- Save state to disk before shutdown

### 2. Recovery Checkpoint Logic
- Implement checkpoint storage (file-based)
- Add restoration logic on engine restart
- Verify recovery state matches pre-shutdown state

### 3. Production Monitoring Integration
- Add health check endpoint
- Integrate with production metrics system
- Add alerting hooks for critical conditions

### 4. Production Integration Tests
- Test graceful shutdown scenarios
- Test recovery from checkpoint
- Test production monitoring integration
- Verify all tests pass with >95% coverage

---

## Verification Strategy

1. **Integration Test:** Run production-readiness integration tests
2. **Recovery Test:** Test recovery from checkpoint after simulated crash
3. **Monitoring Test:** Verify health checks and metrics export
4. **Shutdown Test:** Test graceful shutdown and state preservation

---

## Handoff Readiness

✅ Ready to proceed to WORK scheme once Builder receives approval to begin production-readiness implementation.

---

**Next:** BUILDER WORK — implement shutdown handler, checkpoint logic, monitoring integration, emit `build-step7-builder-work-*.md`
