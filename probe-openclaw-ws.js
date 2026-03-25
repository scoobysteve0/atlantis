/**
 * OpenClaw WebSocket Probe
 * Run from your Mac terminal: node probe-openclaw-ws.js <your-token>
 * Token is the one you enter in the Atlantis settings panel
 */
const crypto = require('crypto');
const net = require('net');

const TOKEN = process.argv[2] || '';
const PORT = 18789;

if (!TOKEN) {
  console.error('Usage: node probe-openclaw-ws.js <your-openclaw-token>');
  process.exit(1);
}

function deriveGatewayToken(gatewayToken, port) {
  return crypto
    .createHmac('sha256', gatewayToken)
    .update(`openclaw-extension-relay-v1:${port}`)
    .digest('hex');
}

const relayToken = deriveGatewayToken(TOKEN, PORT);
const wsKey = crypto.randomBytes(16).toString('base64');

console.log('Connecting to ws://127.0.0.1:18789/gateway ...');

const socket = net.createConnection({ host: '127.0.0.1', port: PORT }, () => {
  socket.write(
    `GET /gateway?token=${encodeURIComponent(relayToken)} HTTP/1.1\r\n` +
    `Host: 127.0.0.1:${PORT}\r\n` +
    `Upgrade: websocket\r\n` +
    `Connection: Upgrade\r\n` +
    `Sec-WebSocket-Key: ${wsKey}\r\n` +
    `Sec-WebSocket-Version: 13\r\n\r\n`
  );
});

let buffer = Buffer.alloc(0);
let upgraded = false;
let frameCount = 0;

socket.on('data', (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);

  if (!upgraded) {
    const headerEnd = buffer.indexOf('\r\n\r\n');
    if (headerEnd !== -1) {
      const headers = buffer.slice(0, headerEnd).toString();
      if (headers.includes('101')) {
        upgraded = true;
        console.log('✅ WebSocket connected. Listening for messages (10s timeout)...\n');
        buffer = buffer.slice(headerEnd + 4);
        parseFrames();
      } else {
        console.log('❌ Upgrade rejected:');
        console.log(headers);
        socket.destroy();
      }
    }
  } else {
    parseFrames();
  }
});

function parseFrames() {
  while (buffer.length >= 2) {
    const b0 = buffer[0];
    const b1 = buffer[1];
    const opcode = b0 & 0x0f;
    const masked = (b1 & 0x80) !== 0;
    let payloadLen = b1 & 0x7f;
    let offset = 2;

    if (payloadLen === 126) {
      if (buffer.length < 4) return;
      payloadLen = buffer.readUInt16BE(2);
      offset = 4;
    } else if (payloadLen === 127) {
      if (buffer.length < 10) return;
      payloadLen = Number(buffer.readBigUInt64BE(2));
      offset = 10;
    }
    if (masked) offset += 4;
    if (buffer.length < offset + payloadLen) return;

    const payload = buffer.slice(offset, offset + payloadLen);
    buffer = buffer.slice(offset + payloadLen);

    if (opcode === 1) {
      frameCount++;
      const text = payload.toString('utf8');
      console.log(`--- Frame ${frameCount} ---`);
      try {
        const parsed = JSON.parse(text);
        console.log(JSON.stringify(parsed, null, 2));
      } catch {
        console.log(text);
      }
      console.log('');
      if (frameCount >= 5) {
        console.log('[Got 5 frames — stopping. Paste output above to Claude.]');
        socket.destroy();
      }
    } else if (opcode === 9) {
      // ping — send pong
      const pong = Buffer.from([0x8a, 0x00]);
      socket.write(pong);
    } else if (opcode === 8) {
      console.log('[Server closed connection]');
      socket.destroy();
    }
  }
}

socket.on('error', (err) => console.error('Error:', err.message));
socket.on('close', () => {
  if (frameCount === 0) console.log('No frames received.');
});

setTimeout(() => {
  if (frameCount === 0) console.log('[Timeout — no messages in 10s. OpenClaw may not be broadcasting yet.]');
  socket.destroy();
}, 10000);
