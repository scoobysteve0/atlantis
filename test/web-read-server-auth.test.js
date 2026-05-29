const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const { createWebReadServer } = require('../src/main/web-read-server');

function requestJson({ port, method = 'GET', path: requestPath, token, body }) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      host: '127.0.0.1',
      port,
      method,
      path: requestPath,
      headers: {
        Accept: 'application/json',
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { 'X-Atlantis-Token': token } : {})
      }
    }, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: raw ? JSON.parse(raw) : null });
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function requestHttpsJson({ port, method = 'GET', path: requestPath, token, body }) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      host: '127.0.0.1',
      port,
      method,
      path: requestPath,
      rejectUnauthorized: false,
      headers: {
        Accept: 'application/json',
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { 'X-Atlantis-Token': token } : {})
      }
    }, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: raw ? JSON.parse(raw) : null });
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function makeServer() {
  const appRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'atlantis-web-auth-'));
  const rendererRoot = path.join(appRoot, 'src', 'renderer');
  fs.mkdirSync(rendererRoot, { recursive: true });
  fs.writeFileSync(path.join(rendererRoot, 'index.html'), '<!doctype html><title>Atlantis</title>');

  const inviteService = {
    getSessionFromRequest: () => null,
    touchSession: () => {},
    buildClearCookie: () => 'atlantis_session=; Path=/; Max-Age=0'
  };

  return createWebReadServer({
    appRoot,
    readBridgeStatus: async () => ({ bridge: {}, status: {} }),
    getProjects: async () => [],
    sendChatMessage: async ({ text }) => ({ message: { text }, routeResult: { status: 'streaming' } }),
    writeToken: 'test-token',
    inviteService
  });
}

function makeTlsService() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'atlantis-web-tls-'));
  const keyPath = path.join(dir, 'key.pem');
  const certPath = path.join(dir, 'cert.pem');

  try {
    execFileSync('openssl', [
      'req',
      '-x509',
      '-newkey', 'rsa:2048',
      '-keyout', keyPath,
      '-out', certPath,
      '-sha256',
      '-days', '1',
      '-nodes',
      '-subj', '/CN=localhost'
    ], { stdio: 'ignore' });
  } catch (error) {
    return null;
  }

  return {
    loadCertFiles: () => ({
      key: fs.readFileSync(keyPath, 'utf8'),
      cert: fs.readFileSync(certPath, 'utf8')
    }),
    getProfile: () => ({ domain: 'atlantis.psyoplabs.co' })
  };
}

test('web-read server: sensitive read APIs require browser session or machine token', async () => {
  const server = makeServer();
  const relay = await server.start({ host: '127.0.0.1', port: 0 });
  try {
    const health = await requestJson({ port: relay.port, path: '/api/read/health' });
    assert.equal(health.statusCode, 200);

    const denied = await requestJson({ port: relay.port, path: '/api/read/snapshot' });
    assert.equal(denied.statusCode, 401);

    const allowed = await requestJson({ port: relay.port, path: '/api/read/snapshot', token: 'test-token' });
    assert.equal(allowed.statusCode, 200);
    assert.equal(allowed.body.metadata.runtimeMode, 'web-controlled');
  } finally {
    await server.stop();
  }
});

test('web-read server: chat send uses token auth instead of browser session auth', async () => {
  const server = makeServer();
  const relay = await server.start({ host: '127.0.0.1', port: 0 });
  try {
    const denied = await requestJson({
      port: relay.port,
      method: 'POST',
      path: '/api/chat/send',
      token: 'wrong-token',
      body: { message: 'hello' }
    });
    assert.equal(denied.statusCode, 401);
    assert.match(denied.body.detail, /Atlantis write token/);

    const allowed = await requestJson({
      port: relay.port,
      method: 'POST',
      path: '/api/chat/send',
      token: 'test-token',
      body: { message: 'hello' }
    });
    assert.equal(allowed.statusCode, 200);
    assert.equal(allowed.body.result.routeResult.status, 'streaming');
  } finally {
    await server.stop();
  }
});

test('web-read server: HTTPS can bind a configured non-root port', async (t) => {
  const tlsService = makeTlsService();
  if (!tlsService) {
    t.skip('openssl unavailable for test certificate generation');
    return;
  }

  const previousHttps = process.env.ATLANTIS_WEB_HTTPS;
  const previousRedirectPort = process.env.ATLANTIS_WEB_REDIRECT_PORT;
  process.env.ATLANTIS_WEB_HTTPS = '1';
  process.env.ATLANTIS_WEB_REDIRECT_PORT = '0';

  const appRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'atlantis-web-auth-https-'));
  const rendererRoot = path.join(appRoot, 'src', 'renderer');
  fs.mkdirSync(rendererRoot, { recursive: true });
  fs.writeFileSync(path.join(rendererRoot, 'index.html'), '<!doctype html><title>Atlantis</title>');
  const httpsServer = createWebReadServer({
    appRoot,
    readBridgeStatus: async () => ({ bridge: {}, status: {} }),
    getProjects: async () => [],
    writeToken: 'test-token',
    tlsService,
    inviteService: {
      getSessionFromRequest: () => null,
      touchSession: () => {},
      buildClearCookie: () => 'atlantis_session=; Path=/; Max-Age=0'
    }
  });

  try {
    const relay = await httpsServer.start({ host: '127.0.0.1', port: 0 });
    assert.equal(relay.protocol, 'https');
    assert.equal(relay.httpsEnabled, true);
    assert.notEqual(relay.port, 443);
    assert.equal(relay.domain, 'atlantis.psyoplabs.co');

    const health = await requestHttpsJson({ port: relay.port, path: '/api/read/health' });
    assert.equal(health.statusCode, 200);
    assert.equal(health.body.ok, true);
  } finally {
    await httpsServer.stop();
    if (previousHttps === undefined) delete process.env.ATLANTIS_WEB_HTTPS;
    else process.env.ATLANTIS_WEB_HTTPS = previousHttps;
    if (previousRedirectPort === undefined) delete process.env.ATLANTIS_WEB_REDIRECT_PORT;
    else process.env.ATLANTIS_WEB_REDIRECT_PORT = previousRedirectPort;
  }
});
