# Atlantis Live Bridge API Contract (v3.4)

Atlantis consumes a normalized payload shape:

```json
{
  "agents": [{ "role": "Planner", "name": "Jarvis", "status": "primed" }],
  "projects": [{ "id": "atlantis", "name": "Atlantis", "status": "active", "active": true }],
  "iterations": [{ "id": "core-memory", "name": "Core Memory", "status": "in-progress", "focus": "..." }],
  "tasks": [{ "id": "task-1", "projectId": "atlantis", "type": "agent", "description": "...", "assignedTo": "Builder", "status": "in-progress", "completed": false }]
}
```

## Endpoints

### `GET /api/status` (or `/status` / `/session_status`)
Primary health/status source.

Expected fields (best-effort):
- `agents[]`: role/name/status for agent cards.
- `iterations[]` (optional): surfaced directly in iteration lists.

### `GET /api/sessions` (or `/sessions`)
Active OpenClaw session feed.

Expected fields per session (best-effort):
- `id`
- `projectId` or `project`
- `agent` or `name`
- `status` or `state`
- `label`/`summary`/`command`

## Mapping Rules

- Sessions are mapped into Atlantis task cards.
- Unknown/partial fields are tolerated; fallback labels are generated.
- Status values are normalized to Atlantis UI states (`primed`, `idle`, `duty`, and task statuses).

## Fallback Contract

If live endpoints fail:
1. Use local mock JSON (`data.json`) for deterministic rendering.
2. If mock is unavailable, use cached last-good payload.
3. UI must display a visible warning + source badge (`OpenClaw Live`, `Mock JSON`, or `Cached Snapshot`).
