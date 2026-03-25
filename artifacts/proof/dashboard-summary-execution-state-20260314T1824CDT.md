# Dashboard execution state summary

Timestamp: 2026-03-14 18:24 CDT

## Product change
Added an execution-state panel to Atlantis project cards so the dashboard itself shows:
- current owner
- last proof event
- next trigger

This makes real runtime state visible before opening the project detail view.

## Files changed
- src/renderer/js/ui/dashboard-ui.js
- src/renderer/css/styles.css

## Planned validation
- node --check src/renderer/js/ui/dashboard-ui.js
- npm run pack

## Expected packaged artifact
- dist/mac-arm64/Atlantis.app
