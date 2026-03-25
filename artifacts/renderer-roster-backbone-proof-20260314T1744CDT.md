# Atlantis Renderer Backbone Proof

## Scheme
Implement Atlantis project backbone in the renderer

## Real work completed
- Hydrated the open-project renderer view from the canonical `agents` roster instead of trusting stale hardcoded owner strings.
- Builder / Reviewer / Auditor / Supervisor cards now resolve from the live roster model map.
- Active scheme owner now shows the canonical Builder name + model.
- Updated scheme copy from governance language to implementation language.

## Changed files
- `src/renderer/js/ui/dashboard-ui.js`

## Validation
- `node --check src/renderer/js/ui/dashboard-ui.js`
- `node --check src/renderer/js/core/orchestration-service.js`
- `node --check src/renderer/js/main.js`

## Expected visible result
In the Atlantis open-project view:
- Builder resolves to `Operator / ollama/qwen3-coder-next:cloud`
- Reviewer resolves to `Reviewer / google/gemini-3-flash-preview`
- Auditor resolves to `Analyst / xai/grok-4-fast-reasoning`
- Supervisor resolves to `Jarvis / openai-codex/gpt-5.3-codex`
- Scheme section wording reflects implementation work rather than governance wording.
