# DELTA_PROOF — Phase 4 Step 1 — Settings token field

Timestamp: 2026-03-19 14:32 CDT
Status: READY
Owner: BUILDER
Step: 1
Scheme: DELTA_PROOF
Target files:
- `src/renderer/index.html`
- `src/renderer/js/main.js`

## Objective
Add an OpenClaw token field to the Settings modal so the renderer patch already in place can actually receive a token via local settings.

## Confirmed gap
The token fetch path now exists in `data-service.js`, but the current app has:
- base URL field in Settings
- no token field in Settings
- no save path for `atlantis.openclawToken`

So the token cannot reach the app through the current UI.

## Minimal code change

### 1) Add token input to Settings modal in `src/renderer/index.html`
Add directly below the base URL field:

```html
<label class="modal-label" for="openclaw-token-input">OpenClaw Token</label>
<input id="openclaw-token-input" type="password" placeholder="Paste token" spellcheck="false" autocomplete="off" />
```

Why:
- `type="password"` prevents visible rendering during entry
- keeps it local to the modal
- avoids displaying the token in normal UI state

### 2) Wire token input in `src/renderer/js/main.js`
Add DOM binding:

```js
const openClawTokenInput = document.getElementById("openclaw-token-input");
```

### 3) Load saved token into the field when opening Settings
Minimal safe pattern:

```js
const configuredToken = localStorage.getItem("atlantis.openclawToken") || "";
openClawTokenInput.value = configuredToken;
```

Notes:
- no logging
- no warning text interpolation
- token remains modal-local only

### 4) Save token on Save + Refresh
Inside the save handler:

```js
const nextToken = openClawTokenInput.value.trim();
...
if (nextToken) {
  localStorage.setItem("atlantis.openclawToken", nextToken);
} else {
  localStorage.removeItem("atlantis.openclawToken");
}
```

## Sensitive-data guardrails
Must **not**:
- include token in `store.log(...)`
- include token in `maybeNotify(...)`
- include token in `modalMessage`
- include token in fallback warnings
- print token presence/contents into any visible rendered text

Safe behavior:
- store token only in `localStorage["atlantis.openclawToken"]`
- use password field so it is masked in the modal
- keep all save/refresh success text limited to source/result, not credentials

## Recommended exact UX wording
Do **not** mention the token value in save messages.
Current base URL save copy can remain, but should avoid credential references.

## Expected result after patch
- user can paste token into Settings
- Save persists token into localStorage
- next refresh allows `data-service.js` to send `Authorization` header on direct OpenClaw fetches
- token never appears in logs, warnings, or rendered status text

## Summary
Smallest viable implementation:
1. add masked token field to modal
2. hydrate from localStorage on open
3. persist to `atlantis.openclawToken` on save
4. do not log/render/tokenize any credential text
