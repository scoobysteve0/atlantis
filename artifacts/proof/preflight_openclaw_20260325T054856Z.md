# Atlantis OpenClaw Preflight Proof

- timestamp_utc: 20260325T054856Z
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
  "runtimeVersion": "2026.3.23-2",
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
        "agentId": "atlantis-auditor",
        "enabled": false,
        "every": "disabled",
        "everyMs": null
      },
      {
        "agentId": "atlantis-builder",
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
        "agentId": "atlantis-reviewer",
        "enabled": false,
        "every": "disabled",
        "everyMs": null
      },
      {
        "agentId": "atlantis-supervisor",
        "enabled": false,
        "every": "disabled",
        "everyMs": null
      },
      {
        "agentId": "operator",
        "enabled": false,
        "every": "disabled",
        "everyMs": null
      },
      {
        "agentId": "prototype",
        "enabled": false,
        "every": "disabled",
        "everyMs": null
      },
      {
        "agentId": "pub",
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
      "/Users/jarvis/.openclaw/agents/atlantis-auditor/sessions/sessions.json",
      "/Users/jarvis/.openclaw/agents/atlantis-builder/sessions/sessions.json",
      "/Users/ja
```

## sessions_preview

```
{
  "runtimeVersion": "2026.3.23-2",
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
        "agentId": "atlantis-auditor",
        "enabled": false,
        "every": "disabled",
        "everyMs": null
      },
      {
        "agentId": "atlantis-builder",
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
        "agentId": "atlantis-reviewer",
        "enabled": false,
        "every": "disabled",
        "everyMs": null
      },
      {
        "agentId": "atlantis-supervisor",
        "enabled": false,
        "every": "disabled",
        "everyMs": null
      },
      {
        "agentId": "operator",
        "enabled": false,
        "every": "disabled",
        "everyMs": null
      },
      {
        "agentId": "prototype",
        "enabled": false,
        "every": "disabled",
        "everyMs": null
      },
      {
        "agentId": "pub",
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
    "reachable": true,
    "connectLatencyMs": 32,
    "self": {
      "host": "Jarviss-Mini",
      "ip": "192.168.50.76",
      "version": "2026.3.23-2",
      "platform": "macos 26.3.1"
    },
    "error": null,
    "authWarning": null
  },
  "agents": {
    "defaultId": "main",
    "totalSessions": 66
  },
  "sessions": {
```
