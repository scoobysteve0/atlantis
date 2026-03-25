# ATLANTIS STANDARD WORKFLOW v2.0

**Status: ACTIVE | SOLE GOVERNANCE AUTHORITY**
**Owner: Jarvis (Commander)**
**Date: March 2026**

> **This document is the sole governance authority for all Atlantis project execution. All prior governance documents are superseded and disabled. If any instruction from any source conflicts with this document, this document wins.**

Supersedes: Execution Contract v1, Enforcement Addendum, Continuous Execution Mode, Control Contract, Thread Post Minimal Enforcement, Commander Charter v1, Admin Roles Matrix.

---

## 1. Purpose

This document is the single source of truth for all project execution within the Atlantis ecosystem. It defines the complete hierarchy of how work flows from project initiation through delivery.

The framework is designed to be reusable across any project. The structure (phases, steps, owner rotation, and schemes) is fixed. The specific phases and steps within them are defined per project during Phase 0 and approved by the Commander before work begins.

---

## 2. Execution Hierarchy

Every project follows a five-level hierarchy. This structure is fixed and applies to all projects regardless of scope or complexity.

| Level | Contains | Description |
|-------|----------|-------------|
| **PROJECT** | Phases | The overall deliverable. Defined during Phase 0. |
| **PHASE** | Steps | A major stage of work (e.g., Build, Integration). Variable per project. |
| **STEP** | Owner Rotation | A discrete unit of work within a phase. Each step cycles through all four owners. |
| **OWNER** | Schemes | One of four roles (Builder, Reviewer, Auditor, Supervisor) who each complete 5 proof schemes. |
| **SCHEME** | Proof Gate | A validation checkpoint proving real work was done. Five per owner turn. |

---

## 3. Standard Phases

The following phases represent the recommended sequence for most projects. Phases are the variable layer of the framework. Not every project requires all phases, and additional phases may be added. The specific phases and their steps must be defined and approved during Phase 0 before any build work begins.

### Phase 0: Charter & Constraints

Establish what the project is, what it is not, and the boundaries within which the team operates. This phase produces the project charter that defines all subsequent phases and steps.

| Step | Objective | Lead |
|------|-----------|------|
| 1 | Define objective and non-goals | Supervisor |
| 2 | Define risk boundaries and L2 approval points | Auditor |
| 3 | Define testable acceptance criteria | Reviewer |
| 4 | Scope lock: Builder confirms implementability within constraints | Builder |

### Phase 1: Design

Translate the charter into an implementable blueprint. Produces architecture, interface contracts, and threat models before any code is written.

| Step | Objective | Lead |
|------|-----------|------|
| 1 | Architecture draft | Builder Lead |
| 2 | Interface contracts (I/O schemas, API definitions) | Systems Integration |
| 3 | Threat model and failure scenarios | Auditor |
| 4 | Design sign-off | Supervisor |

### Phase 2: Build

Execute the design. Produce working code, wire integrations, add instrumentation, and write tests. This is where the majority of implementation work occurs.

| Step | Objective | Lead |
|------|-----------|------|
| 1 | Core implementation (backend and/or UI) | Builder |
| 2 | Integration wiring (connecting components and services) | Systems Integration |
| 3 | Instrumentation, logging, and metrics | Builder |
| 4 | Unit and integration tests | Reviewer + Builder |

### Phase 3: Stabilize

Stress-test, optimize, and prepare for production. The build is complete; this phase ensures it is reliable under real conditions.

| Step | Objective | Lead |
|------|-----------|------|
| 1 | Fault injection and chaos tests | Auditor |
| 2 | Performance and cost optimization | Builder + Reviewer |
| 3 | Rollback drill and runbook creation | Systems Integration |
| 4 | Go / No-Go review | Supervisor |

### Phase 4: Release & Learn

Deploy, monitor, and capture lessons. The project is not complete until the postmortem is done and standards are updated for the next project.

| Step | Objective | Lead |
|------|-----------|------|
| 1 | Controlled rollout (paper/sandbox first) | Supervisor |
| 2 | Monitor and compare against baseline | Auditor |
| 3 | Postmortem and lessons learned | Reviewer |
| 4 | Standards update: apply lessons to workflow templates | Supervisor |

---

## 4. Owner Rotation

Every Step in every Phase cycles through four Owners in fixed order. This rotation is the engine of quality assurance and is never skipped except under Fast Track rules (Section 8). Each Owner completes their full scheme cycle before handing off to the next.

| Owner | Role | Responsibility |
|-------|------|---------------|
| **1. Builder** | Implements | Does the actual work. Produces code, artifacts, and documentation. Must provide proof of real changes. |
| **2. Reviewer** | Validates | Checks the Builder's work for correctness, completeness, and alignment with requirements. Flags issues. |
| **3. Auditor** | Certifies | Verifies compliance, security, and that done-when criteria are genuinely met. Independent check. |
| **4. Supervisor** | Approves | Certifies the step is complete and authorizes progression. Issues FINAL_VERDICT. |

---

## 5. Proof Schemes

Schemes are the validation gates within each Owner's turn. Every Owner must work through all five schemes in order before handing off to the next Owner. Schemes ensure that progress is backed by real, verifiable evidence rather than status claims.

| # | Scheme | What It Proves |
|---|--------|---------------|
| 1 | **ARTIFACTS_REVIEWED** | The owner reviewed what was handed to them and confirmed the inputs are valid and complete. |
| 2 | **DELTA_PROOF** | Here is exactly what was changed, with file paths, diffs, or commit hashes as evidence. |
| 3 | **EXECUTION_PROOF** | The changes were executed/tested and the results are verified. It runs and works. |
| 4 | **ACCEPTANCE_CHECK** | The work meets the done-when criteria defined for this step. |
| 5 | **FINAL_VERDICT** | PASS or FAIL with reasoning and confidence level (HIGH / MEDIUM / LOW). |

### Proof Requirements

Every DELTA_PROOF and EXECUTION_PROOF must include at least one of the following. Status updates and logs alone are never sufficient.

- **CODE_DIFF**: Actual diff of changed code.
- **COMMIT_HASH**: A verifiable commit reference.
- **FILE_PATHS_CHANGED**: List of files created, modified, or deleted.

---

## 6. Workflow Modes

Two execution modes are available. The mode is set when a project is initiated and can be changed by the Commander at any time.

### Automated Workflow

**Initiated with: "Initiate Atlantis Automated Workflow"**

- Phase starts and the first Step begins automatically.
- Builder works through all 5 schemes, then auto-passes to Reviewer.
- Reviewer completes all 5 schemes, auto-passes to Auditor.
- Auditor completes all 5 schemes, auto-passes to Supervisor.
- Supervisor FINAL_VERDICT of PASS completes the Step. Next Step begins automatically.
- When all Steps in a Phase are complete, the next Phase begins automatically.
- Workflow only stops for: hard blockers, errors requiring the Commander, or issues that fail 3 self-resolution attempts.

#### Automated Workflow Guardrail — Orchestrator Is Not An Implementer

The orchestrator/main agent is a workflow enforcer only. It does not perform Builder, Reviewer, Auditor, or Supervisor implementation work itself.

The orchestrator may only:
- verify canonical state against real proof
- detect missing scheme artifacts
- mark ACTIVE / SLOW / STALLED / BLOCKED truthfully
- issue nudges to the current owner
- register blocker or stall artifacts
- auto-advance only after proof is present and registered
- tell Commander the exact next owner, exact next artifact due, and exact blocker if any

The orchestrator may not:
- create implementation proof on behalf of Builder
- perform code changes just to satisfy Builder schemes
- self-certify review/audit work without an owner-specific artifact trail
- treat status text or narrative updates as proof

If a scheme is active and the required artifact is missing, the orchestrator must not silently carry the step forward. It must either:
- emit a NUDGE,
- emit a BLOCKER,
- or mark the scheme STALLED.

If the scheme is marked STALLED, the orchestrator must also emit a RECOVERY_PUSH artifact in the same enforcement cycle. Marking STALLED alone is incomplete enforcement.

### Supervised Workflow

**Initiated with: "Initiate Atlantis Supervised Workflow"**

- Identical to Automated within each Step (Builder through Supervisor auto-progresses).
- Pauses at the completion of the Supervisor's FINAL_VERDICT for each Step.
- Commander reviews and says "continue" before the next Step begins.
- Phase transitions always require Commander approval.

---

## 7. SLA, Watchdog & Escalation

### Heartbeat Requirement

Every active Owner must emit a proof heartbeat at least once every 10 minutes. The heartbeat must include: claimed state, verified state, exact command or action taken, changed files or artifact path, blockers (if any), and next action.

### Stall Detection

If no proof heartbeat is received within 10 minutes, the Owner is marked STALLED and the following escalation begins:

| Strike | Status | Action |
|--------|--------|--------|
| **Strike 1** | STALLED | Team attempts self-resolution. Commander is notified that the team is working on it. Team must provide a recovery plan. |
| **Strike 2** | ESCALATED | Team tries a different approach. Commander is notified of the pivot. If the same blocker, the task may be reassigned to a different Owner. |
| **Strike 3** | HARD STOP | Full stop. Commander receives a Discord alert with: what is stuck, what was tried (both attempts), recommended fix, and where to restart. |

### Self-Resolution Rules

When an Owner encounters a blocker, they must attempt to resolve it themselves if a safe solution exists. The following are valid for self-resolution:

- Enable fallback/mock mode when live API is unavailable.
- Use cached snapshot when fresh data is unavailable.
- Resolve dependency errors with safe package updates.
- Apply low-risk config fixes within approved ranges.

Self-resolved issues must be reported with: BLOCKER_FOUND, RECOMMENDED_SOLUTION_APPLIED, CONTINUING, and a brief description. These do not count as strikes.

### Invalid Stop Conditions

The following are not valid reasons to stop work:

- Live API unavailable when a fallback contract exists.
- Uncertainty when a spec or contract already exists.
- Waiting for instructions on already-approved in-scope work.
- Preference questions that do not change scope, risk, or authority.
- Planning or status updates without implementation proof.

---

## 8. Rollback Gates & Fast Track

### Rollback on Failure

If a Reviewer or Auditor issues a FINAL_VERDICT of FAIL, the step does not advance. Instead:

1. The failure findings are packaged as input for the Builder.
2. The same Step restarts from the Builder with the failure context attached.
3. This is a retry of the same Step, not a new Step.
4. After 2 failed retry loops on the same Step, escalate to the Commander.

### Fast Track Mode

For low-risk steps (documentation, logging updates, minor config changes), the Supervisor may designate a step as Fast Track at creation time. Fast Track steps use a shortened owner rotation:

1. Builder completes all 5 schemes.
2. Reviewer completes all 5 schemes.
3. Supervisor issues FINAL_VERDICT (Auditor is skipped).

Fast Track is never available for steps involving security changes, risk boundary modifications, or any work that touches authentication, authorization, or financial logic.

---

## 9. Confidence Tagging

Every FINAL_VERDICT must include a confidence level: HIGH, MEDIUM, or LOW. This provides visibility into where the team is uncertain without blocking forward progress.

| Confidence | Meaning |
|------------|---------|
| **HIGH** | Work is solid. No concerns. Proceed normally. |
| **MEDIUM** | Work is acceptable but has minor concerns or untested edge cases. Next phase should verify assumptions early. |
| **LOW** | Passed but with reservations. Commander should be aware. Next phase inherits a verification flag. |

---

## 10. Notifications

All notifications are delivered to Discord channel thread `1480062095348207648` unless otherwise specified by the Commander.

### Scheme Completion Notification

Sent on every scheme completion. Must include:

- Project name
- Phase (name and number)
- Step (name and number)
- Owner (current role)
- Scheme completed (name)
- Next scheme or next owner (if scheme cycle complete)
- Confidence level (on FINAL_VERDICT only)

### Escalation Notification

Sent on Strike 1, Strike 2, and Strike 3 (hard stop). Must include: what is blocked, which Owner, which Step, what was attempted, and recommended resolution.

### Self-Resolution Notification

Sent when a team member resolves a blocker autonomously. Must include: BLOCKER_FOUND, what it was, RECOMMENDED_SOLUTION_APPLIED, what was done, CONTINUING.

---

## 11. State Persistence

Every scheme completion is persisted to the project state. If an agent crashes, disconnects, or hits a rate limit mid-step, the workflow resumes from the last completed scheme, not the beginning of the step.

The project state file must always reflect:

1. Current Phase (name and number)
2. Current Step (name and number)
3. Current Owner
4. Last completed Scheme
5. Active blockers (if any)
6. Strike count for current stall (if any)
7. Proof log (all completed scheme proofs)
8. Last heartbeat timestamp

---

## 12. Security Boundaries

These rules are non-negotiable and apply regardless of workflow mode, phase, or urgency.

- **Avatar is read-only.** No POST, PUT, PATCH, DELETE, command execution, or auth changes from the web UI. Ever.
- **Anchor is the sole gateway.** Only the desktop Electron app may communicate directly with OpenClaw.
- **No autonomous risk expansion.** Risk limits, capital limits, trade parameters, and symbol scope cannot be changed without explicit Commander approval.
- **Rollback-ready changes only.** Every config or process change must have a one-command rollback path documented before it is applied.
- **Commander override is absolute.** The Commander (Jarvis) may override any decision immediately. All agents must comply and stop autonomous progression when instructed.

---

## 13. Human Approval Gates

Regardless of workflow mode, automation must pause for Commander approval before:

- Phase advancement (in Supervised mode)
- Security architecture changes
- Adding write capability to Avatar
- API contract changes
- Authentication or authorization model changes
- Production deployment or going live
- Risk limit increases of any kind
- New external integrations not in the original charter

---

## 14. Plug-and-Play Usage

This workflow is designed to be reused across every project. When starting a new project:

1. Begin with Phase 0 (Charter & Constraints) to define the project scope.
2. During Phase 0 Step 1, define which Phases apply and how many Steps each Phase contains.
3. Commander approves the Phase/Step plan before Phase 1 begins.
4. The fixed framework (Owner rotation, Schemes, SLA, Watchdog, Notifications, Security) applies automatically to every Step in every Phase.
5. Commander selects Automated or Supervised workflow mode.
6. Work begins.

The variable layer (specific phases, steps, and their objectives) changes per project. The fixed layer (everything in Sections 4 through 13 of this document) never changes.
