export function createStore() {
  const state = {
    activeView: "dashboard",
    missionSidebarCollapsed: false,
    agents: [
      { role: "Planner", model: "Codex", status: "primed" },
      { role: "Builder", model: "Grok", status: "duty" },
      { role: "Verifier", model: "Claude", status: "idle" },
      { role: "Publisher", model: "Gemini", status: "primed" }
    ],
    projects: [
      {
        id: "atlas-core",
        name: "Atlas Core Upgrade",
        status: "duty",
        color: "blue",
        waveLabel: "In Motion",
        tasks: [
          { id: "t1", text: "Ship tokenized UI container", agent: "Builder", source: "agent", active: true, completed: false },
          { id: "t2", text: "Validate accessibility pass", agent: "Verifier", source: "agent", active: false, completed: true },
          { id: "t3", text: "Sync release notes draft", agent: "Publisher", source: "user", active: false, completed: false },
          { id: "t4", text: "Review Discord requests", agent: "Planner", source: "user", active: true, completed: false }
        ]
      },
      {
        id: "nebula-sync",
        name: "Nebula Sync",
        status: "idle",
        color: "violet",
        waveLabel: "Staged",
        tasks: [
          { id: "t5", text: "Finalize migration script", agent: "Builder", source: "agent", active: false, completed: false },
          { id: "t6", text: "Collect user bug cluster", agent: "Planner", source: "user", active: false, completed: true }
        ]
      }
    ],
    selectedProjectId: "atlas-core",
    ideas: [
      "Auto-capture ideas from Discord into project inbox",
      "Add agent recommendation strip based on task type",
      "Escalation warning when tasks idle over 48h"
    ],
    log: []
  };

  const listeners = new Set();
  const notify = () => listeners.forEach((cb) => cb(state));

  const patchProject = (projectId, taskId, patch) => {
    const project = state.projects.find((p) => p.id === projectId);
    const task = project?.tasks.find((t) => t.id === taskId);
    if (!task) return;
    Object.assign(task, patch);
    notify();
  };

  return {
    getState: () => state,
    subscribe: (cb) => (listeners.add(cb), () => listeners.delete(cb)),
    setView(view) { state.activeView = view; notify(); },
    toggleMissionSidebar() { state.missionSidebarCollapsed = !state.missionSidebarCollapsed; notify(); },
    selectProject(projectId) { state.selectedProjectId = projectId; notify(); },
    setTaskCompleted(projectId, taskId, completed) { patchProject(projectId, taskId, { completed }); },
    setTaskActive(projectId, taskId, active) { patchProject(projectId, taskId, { active }); },
    log(message) {
      state.log.unshift(`[${new Date().toLocaleTimeString()}] ${message}`);
      state.log = state.log.slice(0, 200);
      notify();
    }
  };
}
