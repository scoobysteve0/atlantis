# Atlantis Live Integration Proof

Timestamp: 2026-03-14 10:59 CDT

## Objective
Implement the next real live-environment integration change for Atlantis by making the Electron app persist a live OpenClaw/Anchor base URL and exposing a real renderer settings flow to save + refresh against it.

## Commands Executed
```bash
cd /Users/jarvis/.openclaw/workspace && pwd && ls -la && ls -la atlantis-electron atlantis-avatar && find atlantis-electron -maxdepth 4 \( -name 'index.js' -o -name 'store.js' -o -name 'main.js' -o -name '*.json' \) | sort
cd /Users/jarvis/.openclaw/workspace && grep -Rni "openclawBase\|ATLANTIS_OPENCLAW_BASE\|dataService\|load()" atlantis-electron/src/renderer/js atlantis-electron/src/main
cd /Users/jarvis/.openclaw/workspace/atlantis-electron && node --check src/main/index.js && node --check src/main/preload.js && node --check src/renderer/js/main.js
cd /Users/jarvis/.openclaw/workspace/atlantis-electron && git diff -- src/main/index.js src/main/preload.js src/renderer/index.html src/renderer/css/styles.css src/renderer/js/main.js
```

## Files Changed
- src/main/index.js
- src/main/preload.js
- src/renderer/index.html
- src/renderer/css/styles.css
- src/renderer/js/main.js

## Validation Result
- `node --check src/main/index.js` ✅
- `node --check src/main/preload.js` ✅
- `node --check src/renderer/js/main.js` ✅
- Result: `SYNTAX_OK`

## Delivered Change
- Added persistent Electron runtime config file support via `app.getPath('userData')/atlantis-config.json`
- Added IPC handlers:
  - `config:get`
  - `config:openclawBase`
  - `config:setOpenclawBase`
- Exposed safe preload bridge methods for reading/saving the live base
- Removed invalid preload-side `ipcMain`/`localStorage` misuse by replacing preload contents with renderer-safe bridge only
- Replaced placeholder settings modal with a real live feed configuration input and `Save + Refresh` action
- Wired renderer save flow to persist base URL, update localStorage mirror, and immediately refresh live data

## Diff Excerpt
```diff
+const CONFIG_FILE = 'atlantis-config.json';
+
+function getConfigPath() {
+  return path.join(app.getPath('userData'), CONFIG_FILE);
+}
+
+async function readRuntimeConfig() {
+  try {
+    const raw = await fs.promises.readFile(getConfigPath(), 'utf-8');
+    return JSON.parse(raw);
+  } catch (error) {
+    if (error.code === 'ENOENT') {
+      return {};
+    }
+    console.warn('Failed to read Atlantis runtime config:', error);
+    return {};
+  }
+}
+
+ipcMain.handle('config:openclawBase', async () => {
+  const config = await readRuntimeConfig();
+  return normalizeOpenClawBase(process.env.ATLANTIS_OPENCLAW_BASE || config.openclawBase || '');
+});
+ipcMain.handle('config:setOpenclawBase', async (event, value) => {
+  const openclawBase = normalizeOpenClawBase(value);
+  const config = await writeRuntimeConfig({ openclawBase });
+  return { ok: true, openclawBase: config.openclawBase || '' };
+});
```

```diff
+  getConfig: () => ipcRenderer.invoke('config:get'),
+  getOpenClawBase: () => ipcRenderer.invoke('config:openclawBase'),
+  setOpenClawBase: (value) => ipcRenderer.invoke('config:setOpenclawBase', value),
```

```diff
+        <label class="modal-label" for="openclaw-base-input">OpenClaw Base URL</label>
+        <input id="openclaw-base-input" type="url" placeholder="http://localhost:3001" spellcheck="false" autocomplete="off" />
+        <div class="modal-actions">
+          <button id="app-modal-save" type="button">Save + Refresh</button>
```

```diff
+      if (window.electronAPI?.setOpenClawBase) {
+        await window.electronAPI.setOpenClawBase(nextBase);
+      }
+
+      if (nextBase) {
+        localStorage.setItem("atlantis.openclawBase", nextBase);
+      } else {
+        localStorage.removeItem("atlantis.openclawBase");
+      }
+
+      const result = await refresh();
```
