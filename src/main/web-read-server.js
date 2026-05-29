const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { getEnvironment } = require('./environment-resolver');

const DEFAULT_PORT = Number(process.env.ATLANTIS_WEB_READ_PORT || 3017);
const DEFAULT_HOST = process.env.ATLANTIS_WEB_READ_HOST || '127.0.0.1';

function truthy(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

function parseOptionalPort(value, fallback = null) {
  const raw = String(value ?? '').trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 65535 ? parsed : fallback;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function corsHeaders() {
  const allowedOrigin = String(process.env.ATLANTIS_WEB_ALLOWED_ORIGIN || '').trim();
  if (!allowedOrigin) return {};
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Vary': 'Origin'
  };
}

function json(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...corsHeaders(),
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS, POST',
    'Access-Control-Allow-Headers': 'Content-Type, X-Atlantis-Token'
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      if (!body) { resolve({}); return; }
      const contentType = String(req.headers['content-type'] || '').toLowerCase();
      // Handle form POSTs from HTML <form> submissions
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const parsed = {};
        for (const pair of body.split('&')) {
          const [k, ...v] = pair.split('=');
          if (!k) continue;
          parsed[decodeURIComponent(k.replace(/\+/g, ' '))] = decodeURIComponent(v.join('=').replace(/\+/g, ' '));
        }
        resolve(parsed);
        return;
      }
      // Default: JSON
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('invalid-json-body'));
      }
    });
    req.on('error', reject);
  });
}

function resolveLanAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (!entry || entry.internal) continue;
      if (entry.family === 'IPv4') addresses.push(entry.address);
    }
  }

  return [...new Set(addresses)].sort();
}

function sanitizeSnapshot(raw = {}) {
  const bridge = raw?.bridge || {};
  const status = raw?.status || {};
  const sessions = Array.isArray(status.presence)
    ? status.presence
    : Array.isArray(status.sessions)
      ? status.sessions
      : Array.isArray(status.sessions?.sessions)
        ? status.sessions.sessions
        : [];

  return {
    bridge: {
      transport: bridge.transport || 'unknown',
      authority: 'desktop-anchor',
      mode: 'read-only',
      openclawDirectFromAvatar: false,
      allowedReads: Array.isArray(bridge.allowedReads) ? bridge.allowedReads : ['status', 'sessions'],
      blockedWrites: Array.isArray(bridge.blockedWrites) ? bridge.blockedWrites : ['post', 'put', 'patch', 'delete', 'command-exec'],
      checkedAt: bridge.checkedAt || new Date().toISOString(),
      relay: bridge.relay || null
    },
    status: {
      snapshot: status.snapshot || {},
      health: status.health || {},
      presence: sessions.map((session) => ({
        sessionId: session.sessionId || session.id || null,
        key: session.key || null,
        displayName: session.displayName || session.name || session.agent || 'Unknown',
        model: session.model || session.role || 'Unknown',
        status: session.status || session.state || 'idle',
        kind: session.kind || 'agent',
        channel: session.channel || '',
        startedAt: session.startedAt || null,
        updatedAt: session.updatedAt || null,
        estimatedCostUsd: Number(session.estimatedCostUsd || 0),
        contextTokens: Number(session.contextTokens || 0),
        totalTokens: Number(session.totalTokens || 0),
        childSessions: Array.isArray(session.childSessions) ? session.childSessions : [],
        sessionCount: Number(session.sessionCount || 0)
      }))
    },
    projects: Array.isArray(raw?.projects) ? raw.projects : [],
    trading: raw?.trading && typeof raw.trading === 'object' ? raw.trading : {},
    metadata: {
      runtimeMode: 'web-readonly',
      anchor: 'electron',
      readOnly: true,
      relay: bridge.relay || null,
      lanAddresses: resolveLanAddresses(),
      checkedAt: new Date().toISOString()
    }
  };
}

function renderLoginPage({ error = '' } = {}) {
  const errorHtml = error ? `<p class="error">${error}</p>` : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Atlantis — Access Required</title>
  <style>
    :root{color-scheme:dark}
    *{box-sizing:border-box;margin:0;padding:0}
    body{min-height:100vh;display:flex;align-items:center;justify-content:center;
         background:#080e1d;font:15px/1.5 Inter,system-ui,-apple-system,sans-serif;color:#e7ecff}
    .card{background:#101828;border:1px solid #1e2f52;border-radius:20px;padding:40px 36px;
          max-width:400px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.5)}
    h1{font-size:22px;font-weight:700;margin-bottom:6px;color:#fff}
    .sub{color:#7a93c4;font-size:14px;margin-bottom:28px}
    label{display:block;font-size:13px;color:#9fb0d8;margin-bottom:6px;font-weight:500}
    input{width:100%;padding:11px 14px;background:#0b1425;border:1px solid #1e2f52;border-radius:10px;
          color:#e7ecff;font-size:14px;outline:none;transition:border .15s}
    input:focus{border-color:#3b6fd4}
    button{width:100%;margin-top:20px;padding:12px;background:#2255cc;border:none;border-radius:10px;
           color:#fff;font-size:15px;font-weight:600;cursor:pointer;transition:background .15s}
    button:hover{background:#2d6aeb}
    .error{color:#ff8a8a;font-size:13px;margin-top:14px;text-align:center}
    .hint{color:#4a6080;font-size:12px;margin-top:16px;text-align:center}
  </style>
</head>
<body>
  <div class="card">
    <h1>Atlantis</h1>
    <p class="sub">Enter your invite code to access</p>
    <form method="POST" action="/invite/redeem">
      <label for="token">Invite code</label>
      <input id="token" name="token" type="text" placeholder="Paste your invite code" autocomplete="off" autofocus/>
      <button type="submit">Access Atlantis</button>
    </form>
    ${errorHtml}
    <p class="hint">Don't have a code? Ask Steve.</p>
  </div>
</body>
</html>`;
}

function renderInviteLandingPage({ token = '' } = {}) {
  const safeToken = String(token).replace(/[^A-Za-z0-9_-]/g, '');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta name="robots" content="noindex, nofollow"/>
  <title>Atlantis — Invite</title>
  <style>
    :root{color-scheme:dark}
    *{box-sizing:border-box;margin:0;padding:0}
    body{min-height:100vh;display:flex;align-items:center;justify-content:center;
         background:#080e1d;font:15px/1.5 Inter,system-ui,-apple-system,sans-serif;color:#e7ecff}
    .card{background:#101828;border:1px solid #1e2f52;border-radius:20px;padding:44px 36px;
          max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.5);text-align:center}
    h1{font-size:24px;font-weight:700;margin-bottom:10px;color:#fff}
    .sub{color:#7a93c4;font-size:14px;margin-bottom:28px;line-height:1.55}
    button{width:100%;padding:14px;background:#2255cc;border:none;border-radius:10px;
           color:#fff;font-size:16px;font-weight:600;cursor:pointer;transition:background .15s}
    button:hover{background:#2d6aeb}
    .hint{color:#4a6080;font-size:12px;margin-top:18px}
  </style>
</head>
<body>
  <div class="card">
    <h1>Welcome to Atlantis</h1>
    <p class="sub">You've received an invite. Click below to enter — this is a single-use link, so only click when you're ready to start your session.</p>
    <form method="POST" action="/invite/redeem">
      <input type="hidden" name="token" value="${safeToken}"/>
      <button type="submit">Enter Atlantis</button>
    </form>
    <p class="hint">Your session will last 30 days.</p>
  </div>
</body>
</html>`;
}

function createWebReadServer({ appRoot, rendererRoot: explicitRendererRoot, readBridgeStatus, getProjects, getStatusDoc, getEnvironmentInfo, getRuntimeStatus, getTradingData, getDomainDnsStatus, invokeAction, sendChatMessage, getAgentPoolStatus, writeToken, tlsService, inviteService } = {}) {
  if (!appRoot) throw new Error('appRoot is required');
  if (typeof readBridgeStatus !== 'function') throw new Error('readBridgeStatus is required');

  const rendererCandidates = [
    explicitRendererRoot,
    path.join(appRoot, 'src', 'renderer'),
    path.join(appRoot, 'renderer'),
    path.join(process.cwd(), 'src', 'renderer'),
    path.join(process.cwd(), 'renderer'),
    path.join(__dirname, '..', 'renderer')
  ];
  const rendererRoot = rendererCandidates.find((candidate) => candidate && fs.existsSync(path.join(candidate, 'index.html')));
  if (!rendererRoot) throw new Error(`renderer root not found from appRoot=${appRoot}`);
  let server = null;
  let relayInfo = null;

  async function serveFile(reqPath, res) {
    const cleanPath = reqPath === '/' ? '/index.html' : reqPath;
    const normalized = path.normalize(cleanPath).replace(/^\.+/, '');
    const target = path.join(rendererRoot, normalized);

    if (!target.startsWith(rendererRoot)) {
      json(res, 403, { error: 'forbidden' });
      return;
    }

    try {
      const stat = await fs.promises.stat(target);
      if (!stat.isFile()) throw new Error('not-a-file');
      const ext = path.extname(target).toLowerCase();
      const body = await fs.promises.readFile(target);
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=60'
      });
      res.end(body);
    } catch {
      json(res, 404, { error: 'not-found', path: cleanPath });
    }
  }

  function renderFallbackHtml() {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Atlantis Read-Only Fallback</title>
    <style>
      :root { color-scheme: dark; }
      body { margin:0; font: 14px/1.45 Inter, system-ui, -apple-system, Segoe UI, sans-serif; background:#0b1020; color:#e7ecff; }
      .wrap { max-width: 1100px; margin: 0 auto; padding: 24px; }
      .card { background:#121a31; border:1px solid #263252; border-radius:16px; padding:18px; margin-bottom:16px; box-shadow: 0 8px 30px rgba(0,0,0,.25); }
      .muted { color:#9fb0d8; }
      .pill { display:inline-block; padding:4px 10px; border-radius:999px; background:#1d2a4d; color:#cfe0ff; margin-right:8px; font-size:12px; }
      .ok { background:#12341f; color:#9ff0bc; }
      .warn { background:#3b2b10; color:#ffd48a; }
      h1,h2,h3 { margin:0 0 10px; }
      ul { margin:8px 0 0 18px; }
      pre { white-space:pre-wrap; word-break:break-word; background:#0a0f1f; padding:12px; border-radius:12px; border:1px solid #223156; overflow:auto; }
      .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px; }
      .error { color:#ffb4b4; }
      a { color:#9ec5ff; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <h1>Atlantis</h1>
        <div style="margin-top:8px;">
          <span class="pill ok">WEB READ-ONLY FALLBACK</span>
          <span class="pill">Electron remains anchor</span>
        </div>
        <p class="muted" id="summary">Loading snapshot…</p>
      </div>

      <div class="grid">
        <section class="card">
          <h2>Relay</h2>
          <div id="relay">Loading…</div>
        </section>
        <section class="card">
          <h2>Sessions</h2>
          <div id="sessions">Loading…</div>
        </section>
      </div>

      <section class="card">
        <h2>Status Doc</h2>
        <pre id="statusdoc">Loading…</pre>
      </section>

      <section class="card">
        <h2>Raw Diagnostics</h2>
        <pre id="diag">Loading…</pre>
      </section>
    </div>
    <script>
      async function boot() {
        const summary = document.getElementById('summary');
        const relay = document.getElementById('relay');
        const sessions = document.getElementById('sessions');
        const statusdoc = document.getElementById('statusdoc');
        const diag = document.getElementById('diag');
        try {
          const res = await fetch('/api/read/snapshot?t=' + Date.now(), { cache: 'no-store' });
          const data = await res.json();
          const meta = data.metadata || {};
          const bridge = data.bridge || {};
          const presence = Array.isArray(data.status && data.status.presence) ? data.status.presence : [];
          summary.textContent = 'Fallback view loaded. ' + presence.length + ' session(s) visible. Checked ' + (meta.checkedAt || new Date().toISOString());
          relay.innerHTML = [
            '<div><strong>Mode:</strong> ' + (meta.runtimeMode || 'unknown') + '</div>',
            '<div><strong>Anchor:</strong> ' + (meta.anchor || 'unknown') + '</div>',
            '<div><strong>Read-only:</strong> ' + String(meta.readOnly) + '</div>',
            '<div><strong>LAN:</strong> ' + ((meta.lanAddresses || []).join(', ') || 'none') + '</div>',
            '<div><strong>Allowed reads:</strong> ' + ((bridge.allowedReads || []).join(', ') || 'none') + '</div>'
          ].join('');
          sessions.innerHTML = presence.length
            ? '<ul>' + presence.map((s) => '<li><strong>' + (s.displayName || 'Unknown') + '</strong> · ' + (s.status || 'unknown') + ' · ' + (s.model || 'Unknown') + '</li>').join('') + '</ul>'
            : '<span class="muted">No sessions visible.</span>';
          statusdoc.textContent = data.statusDoc || 'No status doc available.';
          diag.textContent = JSON.stringify({ bridge: data.bridge, metadata: data.metadata, status: data.status }, null, 2);
        } catch (error) {
          summary.innerHTML = '<span class="error">Fallback failed: ' + (error && error.message ? error.message : String(error)) + '</span>';
          diag.textContent = String(error && error.stack ? error.stack : error);
        }
      }
      boot();
    </script>
  </body>
</html>`;
  }

  const isHttps = () => Boolean(relayInfo?.httpsEnabled);

  async function handler(req, res) {
    try {
      const remote = req.socket?.remoteAddress || 'unknown';
      const hostHeader = req.headers?.host || 'no-host';
      console.log(`[web-read] ${req.method} ${req.url} from=${remote} host=${hostHeader}`);
    } catch {}

    const url = new URL(req.url, 'http://127.0.0.1');

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        ...corsHeaders(),
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS, POST',
        'Access-Control-Allow-Headers': 'Content-Type, X-Atlantis-Token'
      });
      res.end();
      return;
    }

    if (!['GET', 'HEAD', 'POST'].includes(req.method || 'GET')) {
      json(res, 405, { error: 'method-not-allowed', allowed: ['GET', 'HEAD', 'POST', 'OPTIONS'] });
      return;
    }

    // ── Public routes (no auth required) ────────────────────────────────────
    // Health check — always public so monitoring can reach it
    if (url.pathname === '/api/read/health') {
      json(res, 200, {
        ok: true,
        mode: isHttps() ? 'web-https' : 'web-readonly',
        relay: relayInfo,
        checkedAt: new Date().toISOString()
      });
      return;
    }

    // Invite redemption — GET shows login page, POST validates token
    if (url.pathname === '/login' || url.pathname === '/login.html') {
      const body = renderLoginPage();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(body);
      return;
    }

    // GET /invite/:token — show a confirmation landing page (does NOT redeem)
    // This protects against link-preview crawlers (Discord, Slack, iMessage, etc.)
    // that prefetch URLs and would otherwise burn the invite.
    // Actual redemption happens via POST /invite/redeem when the user clicks the button.
    if (url.pathname.startsWith('/invite/') && req.method === 'GET') {
      const token = url.pathname.slice('/invite/'.length).trim();
      const body = renderInviteLandingPage({ token });
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        // Discourage crawlers from indexing
        'X-Robots-Tag': 'noindex, nofollow, noarchive'
      });
      res.end(body);
      return;
    }

    if (url.pathname === '/invite/redeem' && req.method === 'POST') {
      let body;
      try { body = await readBody(req); } catch { body = {}; }
      const token = String(body?.token || '').trim();
      if (!inviteService || !token) {
        const html = renderLoginPage({ error: 'Please enter your invite code.' });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(html);
        return;
      }
      const result = inviteService.redeemInvite(token);
      if (!result.ok) {
        const html = renderLoginPage({ error: result.detail || 'Invalid or expired code.' });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(html);
        return;
      }
      const cookie = inviteService.buildSessionCookie(result.session.sessionId, { secure: isHttps() });
      res.writeHead(302, { 'Set-Cookie': cookie, Location: '/', 'Cache-Control': 'no-store' });
      res.end();
      return;
    }

    // Logout
    if (url.pathname === '/logout') {
      const clearCookie = inviteService ? inviteService.buildClearCookie() : `atlantis_session=; Path=/; Max-Age=0`;
      res.writeHead(302, { 'Set-Cookie': clearCookie, Location: '/login', 'Cache-Control': 'no-store' });
      res.end();
      return;
    }

    const isOpenReadApi = url.pathname === '/api/read/health' || url.pathname === '/api/read/meta';
    const isTokenWriteApi = url.pathname === '/api/chat/send' || url.pathname === '/api/control/action';
    const hasValidToken = Boolean(writeToken && req.headers['x-atlantis-token'] === writeToken);

    // ── Auth gate — browser routes require a valid session ───────────────────
    // Public exposure through Funnel means read APIs with runtime/project data
    // must require either an invite session or the machine token. Health/meta
    // stay open for monitoring and setup diagnostics.
    if (inviteService) {
      const requiresSession = !isOpenReadApi && !isTokenWriteApi && !hasValidToken;
      const session = requiresSession
        ? inviteService.getSessionFromRequest(req)
        : null;
      if (!session && requiresSession) {
        // API requests get 401 JSON; browser requests get login redirect
        const wantsJson = (req.headers.accept || '').includes('application/json') ||
                          url.pathname.startsWith('/api/');
        if (wantsJson) {
          json(res, 401, { error: 'unauthorized', detail: 'Valid session required.', loginUrl: '/login' });
        } else {
          res.writeHead(302, { Location: '/login', 'Cache-Control': 'no-store' });
          res.end();
        }
        return;
      }
      // Refresh last-seen (fire and forget)
      if (session) {
        try { inviteService.touchSession(session.sessionId); } catch {}
      }
    }

    // ── Authenticated routes ─────────────────────────────────────────────────
    if (url.pathname === '/api/read/meta') {
      json(res, 200, {
        runtimeMode: writeToken ? 'web-controlled' : 'web-readonly',
        readOnly: !writeToken,
        anchor: 'electron',
        relay: relayInfo,
        lanAddresses: resolveLanAddresses(),
        statusDocAvailable: typeof getStatusDoc === 'function',
        writeEnabled: Boolean(writeToken),
        writeAuth: writeToken ? 'token-required' : 'disabled'
      });
      return;
    }

    if (url.pathname === '/api/read/environment') {
      try {
        if (typeof getEnvironmentInfo !== 'function') {
          json(res, 404, { error: 'environment-unavailable' });
          return;
        }
        json(res, 200, { ok: true, result: await getEnvironmentInfo() });
      } catch (error) {
        json(res, 500, { error: 'environment-read-failed', detail: error.message });
      }
      return;
    }

    if (url.pathname === '/api/read/projects') {
      try {
        if (typeof getProjects !== 'function') {
          json(res, 404, { error: 'projects-unavailable' });
          return;
        }
        json(res, 200, { ok: true, result: await getProjects() });
      } catch (error) {
        json(res, 500, { error: 'projects-read-failed', detail: error.message });
      }
      return;
    }

    if (url.pathname === '/api/read/runtime') {
      try {
        if (typeof getRuntimeStatus !== 'function') {
          json(res, 404, { error: 'runtime-unavailable' });
          return;
        }
        json(res, 200, { ok: true, result: await getRuntimeStatus() });
      } catch (error) {
        json(res, 500, { error: 'runtime-read-failed', detail: error.message });
      }
      return;
    }

    // ── POST /api/chat/send ────────────────────────────────────────────────────
    // Lets Jarvis (OpenClaw/Discord) inject a message into Atlantis chat.
    // Body: { fromAgent?, toAgent?, projectId?, role?, message }
    // Auth: X-Atlantis-Token header must match writeToken.
    if (url.pathname === '/api/chat/send') {
      if (!writeToken || typeof sendChatMessage !== 'function') {
        json(res, 403, {
          error: 'chat-send-disabled',
          detail: 'Inbound chat relay is disabled — no write token configured or handler not wired.'
        });
        return;
      }
      const token = req.headers['x-atlantis-token'];
      if (token !== writeToken) {
        json(res, 401, { error: 'unauthorized', detail: 'Missing or invalid Atlantis write token.' });
        return;
      }
      if (req.method !== 'POST') {
        json(res, 405, { error: 'method-not-allowed', allowed: ['POST'] });
        return;
      }
      let body;
      try {
        body = await readBody(req);
      } catch {
        json(res, 400, { error: 'invalid-json-body' });
        return;
      }
      const message = String(body?.message || body?.text || '').trim();
      if (!message) {
        json(res, 400, { error: 'message-required', detail: 'Provide { message: "..." } in the request body.' });
        return;
      }
      try {
        const result = await sendChatMessage({
          fromAgent: String(body?.fromAgent || 'Jarvis'),
          toAgent:   String(body?.toAgent   || 'Ultron'),
          projectId: String(body?.projectId || 'atlantis-home'),
          role:      String(body?.role      || 'Ultron'),
          text: message,
          meta: body?.meta || {}
        });
        json(res, 200, { ok: true, result });
      } catch (error) {
        json(res, 500, { error: 'chat-send-failed', detail: error.message });
      }
      return;
    }

    if (url.pathname === '/api/control/action') {
      if (!writeToken || typeof invokeAction !== 'function') {
        json(res, 403, {
          error: 'write-disabled',
          detail: 'Browser control is disabled because no ATLANTIS_WEB_WRITE_TOKEN is configured in the Electron anchor process.'
        });
        return;
      }
      const token = req.headers['x-atlantis-token'];
      if (token !== writeToken) {
        json(res, 401, {
          error: 'unauthorized',
          detail: 'Missing or invalid Atlantis browser write token.'
        });
        return;
      }
      const payload = await readBody(req);
      const result = await invokeAction(payload || {});
      json(res, 200, { ok: true, result });
      return;
    }

    if (url.pathname === '/api/read/snapshot') {
      try {
        const snapshot = sanitizeSnapshot(await readBridgeStatus());
        if (typeof getProjects === 'function') {
          snapshot.projects = await getProjects();
        }
        if (typeof getStatusDoc === 'function') {
          snapshot.statusDoc = await getStatusDoc();
        }
        if (typeof getTradingData === 'function') {
          snapshot.trading = await getTradingData();
        }
        if (typeof getDomainDnsStatus === 'function') {
          snapshot.domainDns = getDomainDnsStatus();
        }
        // Expose live Pi agent pool status so Jarvis can see which agents are alive
        if (typeof getAgentPoolStatus === 'function') {
          snapshot.agentPool = getAgentPoolStatus();
        }
        // Reflect actual write-enable state in metadata (writeToken is a closure var)
        snapshot.metadata.runtimeMode = writeToken ? 'web-controlled' : 'web-readonly';
        snapshot.metadata.readOnly = !writeToken;
        json(res, 200, snapshot);
      } catch (error) {
        json(res, 502, {
          error: 'snapshot-unavailable',
          detail: error.message,
          relay: relayInfo,
          checkedAt: new Date().toISOString()
        });
      }
      return;
    }

    if (url.pathname === '/fallback' || url.pathname === '/fallback.html') {
      const body = renderFallbackHtml();
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      });
      res.end(body);
      return;
    }

    await serveFile(url.pathname, res);
  }

  let httpRedirectServer = null;

  return {
    async start({ host = DEFAULT_HOST, port = DEFAULT_PORT } = {}) {
      if (server) return relayInfo;

      const certFiles = tlsService ? tlsService.loadCertFiles() : null;
      const requestedPort = parseOptionalPort(port, DEFAULT_PORT);
      const httpsRequested = truthy(process.env.ATLANTIS_WEB_HTTPS) || Number(requestedPort) === 443;
      const useHttps = Boolean(certFiles && httpsRequested);

      if (useHttps) {
        server = https.createServer(
          { cert: certFiles.cert, key: certFiles.key },
          (req, res) => {
            Promise.resolve(handler(req, res)).catch((error) => {
              json(res, 500, { error: 'internal-server-error', detail: error.message });
            });
          }
        );

        const redirectPort = parseOptionalPort(process.env.ATLANTIS_WEB_REDIRECT_PORT, 80);
        if (redirectPort > 0) {
          // Optional HTTP redirect server. This is best-effort because privileged
          // ports require OS/router support on macOS.
          httpRedirectServer = http.createServer((req, res) => {
            const hostHeader = (req.headers.host || '').split(':')[0];
            const publicOrigin = String(
              process.env.ATLANTIS_PUBLIC_ORIGIN
              || getEnvironment().runtimeConfig?.webRelay?.publicOrigin
              || ''
            ).trim().replace(/\/+$/, '');
            const location = publicOrigin
              ? `${publicOrigin}${req.url}`
              : `https://${hostHeader}${req.url}`;
            res.writeHead(301, { Location: location, 'Cache-Control': 'no-store' });
            res.end();
          });

          try {
            await new Promise((resolve, reject) => {
              httpRedirectServer.once('error', reject);
              httpRedirectServer.listen(redirectPort, host, () => resolve());
            });
            console.log(`[web] HTTP→HTTPS redirect server on port ${redirectPort}`);
          } catch (error) {
            console.warn(`[web] Could not bind port ${redirectPort} for redirect (non-fatal):`, error.message);
            httpRedirectServer = null;
          }
        }
      } else {
        server = http.createServer((req, res) => {
          Promise.resolve(handler(req, res)).catch((error) => {
            json(res, 500, { error: 'internal-server-error', detail: error.message });
          });
        });
      }

      const listenHost = host;
      const listenPort = requestedPort;

      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(listenPort, listenHost, () => resolve());
      });

      const address = server.address();
      const boundPort = typeof address === 'object' && address ? address.port : listenPort;
      const protocol = useHttps ? 'https' : 'http';
      const profile = tlsService ? tlsService.getProfile() : null;
      const configuredPublicOrigin = String(
        process.env.ATLANTIS_PUBLIC_ORIGIN
        || getEnvironment().runtimeConfig?.webRelay?.publicOrigin
        || ''
      ).trim().replace(/\/+$/, '');
      const domain = configuredPublicOrigin
        ? (() => {
            try { return new URL(configuredPublicOrigin).host; } catch { return null; }
          })()
        : profile?.domain || null;
      const origin = configuredPublicOrigin
        || (domain ? `${protocol}://${domain}` : `${protocol}://127.0.0.1:${boundPort}`);

      relayInfo = {
        enabled: true,
        host: listenHost,
        port: boundPort,
        protocol,
        httpsEnabled: useHttps,
        domain,
        origin,
        lanUrls: resolveLanAddresses().map((ip) => `${protocol}://${ip}${boundPort !== (useHttps ? 443 : 80) ? `:${boundPort}` : ''}`),
        runtimeMode: writeToken ? 'web-controlled' : 'web-readonly',
        readOnly: !writeToken,
        startedAt: new Date().toISOString()
      };

      console.log(`[web] Server started — ${relayInfo.origin} (${protocol.toUpperCase()})`);
      return relayInfo;
    },

    async stop() {
      if (httpRedirectServer) {
        await new Promise((resolve) => httpRedirectServer.close(() => resolve()));
        httpRedirectServer = null;
      }
      if (!server) return;
      await new Promise((resolve) => server.close(() => resolve()));
      server = null;
      relayInfo = null;
    },

    getRelayInfo() {
      return relayInfo;
    }
  };
}

module.exports = {
  createWebReadServer,
  sanitizeSnapshot,
  resolveLanAddresses
};
