#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -f .env.local ]]; then
  # shellcheck disable=SC1091
  source .env.local
fi

BASE_URL="${ATLANTIS_OPENCLAW_BASE:-}"
BASE_SOURCE="env"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
ARTIFACT_DIR="$ROOT_DIR/artifacts/proof"
ARTIFACT_PATH="$ARTIFACT_DIR/preflight_openclaw_${STAMP}.md"
mkdir -p "$ARTIFACT_DIR"

status="PASS"
blocker=""
status_preview=""
sessions_preview=""
auto_discovery_log="- using OpenClaw CLI health checks\n"

check_openclaw() {
  local status_body=""
  local sessions_body=""
  local status_json=""

  if ! status_json="$(openclaw status --json 2>&1)"; then
    return 1
  fi

  if ! sessions_body="$(printf '%s' "$status_json" | node -e '
let data="";
process.stdin.on("data", c => data += c);
process.stdin.on("end", () => {
  const j = JSON.parse(data);
  const out = {
    runtimeVersion: j.runtimeVersion,
    heartbeat: j.heartbeat,
    gateway: j.gateway,
    agents: j.agents ? { defaultId: j.agents.defaultId, totalSessions: j.agents.totalSessions } : null,
    sessions: j.sessions ? { count: j.sessions.count, recent: (j.sessions.recent || []).slice(0, 3) } : null
  };
  process.stdout.write(JSON.stringify(out, null, 2));
});')"; then
    return 1
  fi

  if ! printf '%s' "$status_json" | node -e '
let data="";
process.stdin.on("data", c => data += c);
process.stdin.on("end", () => {
  const j = JSON.parse(data);
  const ok = !!j.runtimeVersion && !!j.gatewayService?.installed && !!j.nodeService?.installed;
  const gatewayKnown = !!j.gateway?.url;
  process.exit(ok && gatewayKnown ? 0 : 1);
});' ; then
    return 1
  fi

  status_body="$(printf '%s' "$status_json" | head -c 2000)"
  sessions_preview="$(printf '%s' "$sessions_body" | head -c 2000)"
  status_preview="$status_body"
  return 0
}

if [[ -z "$BASE_URL" ]]; then
  BASE_URL="ws://127.0.0.1:18789"
  BASE_SOURCE="openclaw-config-default"
fi

if [[ "$status" == "PASS" ]]; then
  if ! check_openclaw; then
    status="BLOCKED"
    blocker="OpenClaw CLI preflight failed for ${BASE_URL}"
  fi
fi

cat > "$ARTIFACT_PATH" <<EOF
# Atlantis OpenClaw Preflight Proof

- timestamp_utc: $STAMP
- claimed_state: BUILDING_ACTIVE
- verified_state: $([[ "$status" == "PASS" ]] && echo BUILDING_ACTIVE || echo BLOCKED)
- repo: $ROOT_DIR
- command: scripts/preflight-openclaw.sh
- base_url: ${BASE_URL:-UNSET}
- base_source: ${BASE_SOURCE}
- result: $status
- blocker: ${blocker:-none}

## auto_discovery

$(printf '%b' "${auto_discovery_log:-<none>}")

## status_preview

\`\`\`
${status_preview:-<none>}
\`\`\`

## sessions_preview

\`\`\`
${sessions_preview:-<none>}
\`\`\`
EOF

echo "artifact=$ARTIFACT_PATH"
echo "result=$status"
echo "base_url=${BASE_URL:-UNSET}"
echo "base_source=$BASE_SOURCE"
if [[ -n "$blocker" ]]; then
  echo "blocker=$blocker"
fi

if [[ "$status" != "PASS" ]]; then
  exit 2
fi
