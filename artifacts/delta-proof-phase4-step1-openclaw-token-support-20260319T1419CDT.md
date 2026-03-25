# DELTA_PROOF — Phase 4 Step 1 — Minimal OpenClaw token support

Timestamp: 2026-03-19 14:19 CDT
Status: READY
Owner: BUILDER
Step: 1
Scheme: DELTA_PROOF
Target file: `src/renderer/js/core/data-service.js`

## Objective
Wire the live OpenClaw feed so Atlantis can authenticate API calls without exposing the token in the UI or logs.

## Confirmed blocker
`tryOpenClawFeed()` currently calls OpenClaw endpoints with no auth token:
- status paths: `/api/status`, `/status`, `/session_status`
- sessions paths: `/api/sessions`, `/sessions`, `/session/list`

OpenClaw rejects unauthenticated requests, so Atlantis falls back to mock data.

## Minimal safe code change

### 1) Add token-aware headers support to `fetchJson`
Current:
- `fetchJson(url, { timeoutMs = FETCH_TIMEOUT_MS } = {})`

Minimal change:
- accept `headers = undefined`
- pass `headers` into `fetch(...)`

Example:
```js
async function fetchJson(url, { timeoutMs = FETCH_TIMEOUT_MS, headers } = {}) {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`, {
      cache: "no-store",
      signal: controller?.signal,
      headers
    });
```

### 2) Add a resolver for the OpenClaw token
Minimal pattern:
- `window.__ATLANTIS_OPENCLAW_TOKEN__`
- or `localStorage.getItem("atlantis.openclawToken")`
- or `window.electronAPI?.getOpenClawToken?.()`

Example:
```js
async function resolveOpenClawToken() {
  const runtimeToken = window.__ATLANTIS_OPENCLAW_TOKEN__ || localStorage.getItem("atlantis.openclawToken") || "";
  if (runtimeToken) return runtimeToken;

  try {
    return (await window.electronAPI?.getOpenClawToken?.()) || "";
  } catch {
    return "";
  }
}
```

### 3) Pass the Authorization header only inside `tryOpenClawFeed`
Minimal pattern:
```js
async function tryOpenClawFeed(baseUrl, token = "") {
  if (!baseUrl) return null;

  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const attempts = [];
  const headers = token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : undefined;

  for (const statusPath of OPENCLAW_PATHS.status) {
    try {
      const statusPayload = await fetchJson(`${normalizedBase}${statusPath}`, { headers });
      let sessionsPayload = { sessions: [] };

      for (const sessionsPath of OPENCLAW_PATHS.sessions) {
        try {
          sessionsPayload = await fetchJson(`${normalizedBase}${sessionsPath}`, { headers });
          break;
        } catch (error) {
          attempts.push(`sessions ${sessionsPath}: ${error.message}`);
        }
      }

      return {
        payload: validateMappedPayload(mapOpenClawFeed(statusPayload, sessionsPayload), "openclaw-live"),
        warnings: attempts
      };
    } catch (error) {
      attempts.push(`status ${statusPath}: ${error.message}`);
    }
  }
```

### 4) Resolve token during load and pass it down
Minimal call-site delta in `load()`:
```js
const openclawBase = await resolveOpenClawBase();
const openclawToken = await resolveOpenClawToken();
...
const live = await tryOpenClawFeed(openclawBase, openclawToken);
```

## Why this is the minimum viable fix
- touches only the live fetch path in `data-service.js`
- does not change payload mapping
- does not change UI rendering
- does not print or interpolate the token into warnings/errors
- keeps token use scoped to request headers only

## Token exposure guardrails
Do **not**:
- include token in `attempts.push(...)`
- include token in `sourceMeta.warnings`
- include token in `store.log(...)`
- render token in badges, settings text, or any UI field

Do:
- keep token in local variable scope
- pass only via `Authorization` request header
- treat missing token as a normal auth failure path

## Recommended exact header behavior
If token already starts with `Bearer `, use as-is.
Otherwise send:
- `Authorization: Bearer <token>`

## Proposed result after patch
Atlantis should be able to authenticate against:
- `http://127.0.0.1:18789/api/status`
- `http://127.0.0.1:18789/api/sessions`

If auth succeeds, source should return as `openclaw-live` instead of falling back to `mock-json`.

## Summary
Minimal change set:
1. `fetchJson` accepts optional `headers`
2. add `resolveOpenClawToken()`
3. pass token headers inside `tryOpenClawFeed()`
4. call `tryOpenClawFeed(openclawBase, openclawToken)` from `load()`

This is the smallest safe patch that fixes the confirmed auth blocker without surfacing the token in UI or logs.
