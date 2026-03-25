# ATLANTIS THREAD NOTIFICATION SPEC

Use this exact format for Atlantis progress pushes in the thread.

## Format

- Status: ACTIVE | START_DUE | PROOF_DUE | HANDOFF_DUE | STALLED | BLOCKED | READY_FOR_COMMANDER
- Official current position: <phase / step / owner / scheme>
- Last earned position: <phase / step / owner / scheme>
- Last concrete progress: <one sentence>
- Latest proof artifact: <path>
- Latest state-changing artifact: <path>
- Conflict check: <NONE or one-line mismatch>
- Action push: <exact next movement>
- Proof due: <exact artifact due or pattern>
- Next unlock: <what unlocks immediately after success>
- Alert: <only if needed>

## Style rules

- keep it clean and compact
- no vague narration
- no motivational filler
- no "still working" without proof
- always name the exact owner and exact proof due
- if official and earned position differ, report both explicitly

## Purpose

The point of thread notifications is to remove ambiguity.
Every post should make it immediately obvious:
- where Atlantis really is
- what needs to happen next
- who should do it
- what proof is due next
