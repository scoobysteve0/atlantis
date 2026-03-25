# Atlantis OpenClaw Preflight Proof

- timestamp_utc: 20260315T011056Z
- claimed_state: BUILDING_ACTIVE
- verified_state: BUILDING_ACTIVE
- repo: /Users/jarvis/.openclaw/workspace/atlantis-electron
- command: scripts/preflight-openclaw.sh
- base_url: http://127.0.0.1:18789
- base_source: env
- result: PASS
- blocker: none

## auto_discovery

- using OpenClaw CLI health checks

## status_preview

```
{
  "runtimeVersion": "2026.3.13",
  "heartbeat": {
    "defaultAgentId": "main",
    "agents": [
      {
        "agentId": "main",
        "enabled": false,
        "every": "disabled",
        "everyMs": null
      },
      {
        "agentId": "analyst",
        "enabled": false,
        "every": "disabled",
        "everyMs": null
      },
      {
        "agentId": "atlantis-progress",
        "enabled": true,
        "every": "10m",
        "everyMs": 600000
      },
      {
        "agentId": "operator",
        "enabled": false,
        "every": "disabled",
        "everyMs": null
      },
      {
        "agentId": "reviewer",
        "enabled": false,
        "every": "disabled",
        "everyMs": null
      }
    ]
  },
  "channelSummary": [
    "Discord: configured",
    "  - default (token:config)"
  ],
  "queuedSystemEvents": [],
  "sessions": {
    "paths": [
      "/Users/jarvis/.openclaw/agents/main/sessions/sessions.json",
      "/Users/jarvis/.openclaw/agents/analyst/sessions/sessions.json",
      "/Users/jarvis/.openclaw/agents/atlantis-progress/sessions/sessions.json",
      "/Users/jarvis/.openclaw/agents/operator/sessions/sessions.json",
      "/Users/jarvis/.openclaw/agents/reviewer/sessions/sessions.json"
    ],
    "count": 139,
    "defaults": {
      "model": "gpt-5.3-codex",
      "contextTokens": 200000
    },
    "recent": [
      {
        "agentId": "main",
        "key": "agent:main:cron:060ac142-007e-48e7-812b-036bb4f636e1",
        "kind": "direct",
        "sessionId": "bc6f3d8c-20eb-41fc-a4af-e74062905ae4",
        "updatedAt": 1773537049996,
        "age": 7459,
        "systemSent": true,
        "inputTokens": 48281,
        "outputTokens": 355,
        "cacheRead": 19712,
        "cacheWrite": 0,
        "totalTokens": 48315,
        "totalTokensFresh": true,
        "remainingTokens": 223685,
        "percentUsed": 18,
        "model": "gpt-5.4",
        "contextTokens": 272000,
        "flags": [
          "system",
    
```

## sessions_preview

```
{
  "runtimeVersion": "2026.3.13",
  "heartbeat": {
    "defaultAgentId": "main",
    "agents": [
      {
        "agentId": "main",
        "enabled": false,
        "every": "disabled",
        "everyMs": null
      },
      {
        "agentId": "analyst",
        "enabled": false,
        "every": "disabled",
        "everyMs": null
      },
      {
        "agentId": "atlantis-progress",
        "enabled": true,
        "every": "10m",
        "everyMs": 600000
      },
      {
        "agentId": "operator",
        "enabled": false,
        "every": "disabled",
        "everyMs": null
      },
      {
        "agentId": "reviewer",
        "enabled": false,
        "every": "disabled",
        "everyMs": null
      }
    ]
  },
  "gateway": {
    "mode": "local",
    "url": "ws://127.0.0.1:18789",
    "urlSource": "local loopback",
    "misconfigured": false,
    "reachable": false,
    "connectLatencyMs": 50,
    "self": null,
    "error": "missing scope: operator.read",
    "authWarning": null
  },
  "agents": {
    "defaultId": "main",
    "totalSessions": 139
  },
  "sessions": {
    "count": 139,
    "recent": [
      {
        "agentId": "main",
        "key": "agent:main:cron:060ac142-007e-48e7-812b-036bb4f636e1",
        "kind": "direct",
        "sessionId": "bc6f3d8c-20eb-41fc-a4af-e74062905ae4",
        "updatedAt": 1773537049996,
        "age": 7459,
        "systemSent": true,
        "inputTokens": 48281,
        "outputTokens": 355,
        "cacheRead": 19712,
        "cacheWrite": 0,
        "totalTokens": 48315,
        "totalTokensFresh": true,
        "remainingTokens": 223685,
        "percentUsed": 18,
        "model": "gpt-5.4",
        "contextTokens": 272000,
        "flags": [
          "system",
          "id:bc6f3d8c-20eb-41fc-a4af-e74062905ae4"
        ]
      },
      {
        "agentId": "main",
        "key": "agent:main:cron:060ac142-007e-48e7-812b-036bb4f636e1:run:bc6f3d8c-20eb-41fc-a4af-e74062905ae4",
        "kind": "direct",
```
