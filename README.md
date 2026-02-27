# Atlantis

Atlantis is a web-first operations dashboard with optional Electron packaging.

## Run (Web Baseline)

Open `index.html` from a static server at repo root:

```bash
cd atlantis
python3 -m http.server 4173
# visit http://localhost:4173
```

## Run (Electron)

```bash
npm install
npm start
```

## Live Bridge Notes

- Configure live OpenClaw polling by setting `window.__ATLANTIS_OPENCLAW_BASE__` (or localStorage key `atlantis.openclawBase`) to a reachable OpenClaw API host.
- Runtime tries status/session endpoints, maps feed data into agent/project/task cards, and falls back to mock/cached data with a visible warning.
- API contract: `docs/API_CONTRACT.md`

## Changelog

### v3.5
- Added Discord/OpenClaw live pipeline MVP via runtime polling of status/session sources.
- Added feed-to-card mapping for agents/projects/tasks.
- Added graceful fallback path (mock JSON, then cached snapshot) with visible warning and data-source health badge.

### v3.4
- Restored stable web baseline at root `index.html` (pre-electron usability).
- Added live backend bridge scaffolding and frontend data service abstraction for mock-now/API-later.
- Added UI health indicators for data source and last sync timestamp.
