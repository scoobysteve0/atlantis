# Atlantis (v1.7)

Atlantis is a modular operations UI designed to graduate into a desktop app.

## What ships
- **Guardrails**: Naming validation, checklist gate, proof gate.
- **Dashboard**: Kanban-style project board with agent status sidebar.
- **Mission Control**: Auto-Advance toggle + live activity log.

## Architecture
- `js/core/` contains app state and mission logic.
- `js/ui/` contains render/mount logic only.
- `js/config/` holds shared constants.

This separation keeps the app Electron-ready (UI layer can plug into Electron renderer while core stays framework-agnostic).

## Run
Serve statically (for example):

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.
