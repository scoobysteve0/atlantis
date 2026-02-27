const OPENCLAW_PATHS = {
  status: ["/api/status", "/status", "/session_status"],
  sessions: ["/api/sessions", "/sessions", "/session/list"]
};

const MOCK_PATHS = ["./data.json", "./src/renderer/data.json"];
const CACHE_KEY = "atlantis.cachedPayload.v35";

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function mapStatusToAgentStatus(raw = "idle") {
  const status = String(raw).toLowerCase();
  if (["running", "online", "ok", "active"].includes(status)) return "primed";
  if (["error", "failed", "offline"].includes(status)) return "duty";
  return "idle";
}

function mapOpenClawFeed(statusPayload, sessionsPayload) {
  const sessions = toArray(sessionsPayload?.sessions).length
    ? toArray(sessionsPayload.sessions)
    : toArray(sessionsPayload?.data).length
      ? toArray(sessionsPayload.data)
      : toArray(sessionsPayload);

  const statusAgents = toArray(statusPayload?.agents).map((agent, index) => ({
    role: agent.role || `Agent ${index + 1}`,
    name: agent.name || agent.id || "OpenClaw",
    status: mapStatusToAgentStatus(agent.status)
  }));

  const sessionAgents = sessions.slice(0, 6).map((session, index) => ({
    role: session.role || `Session ${index + 1}`,
    name: session.agent || session.name || session.id || "OpenClaw",
    status: mapStatusToAgentStatus(session.status || session.state)
  }));

  const agents = statusAgents.length ? statusAgents : sessionAgents;

  const projectIds = new Set(["atlantis"]);
  sessions.forEach((session) => {
    if (session.projectId) projectIds.add(session.projectId);
    if (session.project) projectIds.add(String(session.project).toLowerCase().replace(/\s+/g, "-"));
  });

  const projects = [...projectIds].map((id) => ({
    id,
    name: id === "atlantis" ? "Atlantis" : id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    status: "active",
    active: true
  }));

  const tasks = sessions.slice(0, 20).map((session, index) => ({
    id: `live-${session.id || index + 1}`,
    projectId: session.projectId || "atlantis",
    type: "agent",
    description: session.label || session.summary || session.command || `Session ${session.id || index + 1}`,
    assignedTo: session.agent || session.name || "OpenClaw",
    status: mapStatusToAgentStatus(session.status || session.state) === "primed" ? "in-progress" : "queued",
    completed: ["complete", "completed", "done"].includes(String(session.status || session.state).toLowerCase())
  }));

  return {
    agents,
    projects,
    iterations: statusPayload?.iterations || [],
    tasks
  };
}

async function fetchJson(url) {
  const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${url} (${response.status})`);
  }
  return response.json();
}

async function tryOpenClawFeed(baseUrl) {
  if (!baseUrl) return null;

  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  for (const statusPath of OPENCLAW_PATHS.status) {
    try {
      const statusPayload = await fetchJson(`${normalizedBase}${statusPath}`);
      let sessionsPayload = { sessions: [] };

      for (const sessionsPath of OPENCLAW_PATHS.sessions) {
        try {
          sessionsPayload = await fetchJson(`${normalizedBase}${sessionsPath}`);
          break;
        } catch {
          // keep trying alternate session endpoints
        }
      }

      return mapOpenClawFeed(statusPayload, sessionsPayload);
    } catch {
      // keep trying alternate status endpoints
    }
  }

  return null;
}

async function tryMockData() {
  for (const path of MOCK_PATHS) {
    try {
      return await fetchJson(path);
    } catch {
      // continue fallback list
    }
  }
  throw new Error("No mock data source available");
}

export function createDataService() {
  return {
    async load() {
      const openclawBase =
        window.__ATLANTIS_OPENCLAW_BASE__ ||
        localStorage.getItem("atlantis.openclawBase") ||
        "";

      const live = await tryOpenClawFeed(openclawBase);
      if (live && live.projects?.length) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(live));
        return { payload: live, source: "openclaw-live", warning: null };
      }

      try {
        const payload = window.electronAPI?.readData ? await window.electronAPI.readData() : await tryMockData();
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
        return {
          payload,
          source: "mock-json",
          warning: openclawBase ? "Live feed unavailable. Using mock data." : "OpenClaw base URL not configured. Using mock data."
        };
      } catch (mockError) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          return {
            payload: JSON.parse(cached),
            source: "cached",
            warning: `Live feed unavailable (${mockError.message}). Using cached snapshot.`
          };
        }

        throw mockError;
      }
    }
  };
}
