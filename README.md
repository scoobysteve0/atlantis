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

- Frontend data service abstraction now supports mock JSON immediately and can be switched to API endpoints later.
- API contract: `docs/API_CONTRACT.md`

## Changelog

### v3.4
- Restored stable web baseline at root `index.html` (pre-electron usability).
- Added live backend bridge scaffolding and frontend data service abstraction for mock-now/API-later.
- Added UI health indicators for data source and last sync timestamp.
