function normalizeData(data = {}) {
  const agents = Array.isArray(data.agents) ? data.agents : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const iterations = Array.isArray(data.iterations) ? data.iterations : [];
  const tasks = Array.isArray(data.tasks)
    ? data.tasks.map((task, index) => ({ id: task.id ?? `task-${index + 1}`, ...task }))
    : [];

  return { agents, projects, iterations, tasks };
}

export function createStore() {
  const state = {
    activeView: "dashboard",
    missionSidebarCollapsed: false,
    agents: [],
    projects: [],
    iterations: [],
    tasks: [],
    selectedProjectId: null,
    lastSyncedAt: null,
    dataSource: "boot",
    syncWarning: null,
    log: []
  };

  const listeners = new Set();
  const notify = () => listeners.forEach((cb) => cb(state));

  const patchTask = (taskId, patch) => {
    const task = state.tasks.find((t) => t.id === taskId);
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
    setTaskCompleted(taskId, completed) { patchTask(taskId, { completed }); },
    setTaskStatus(taskId, status) { patchTask(taskId, { status }); },
    log(message) {
      state.log.unshift(`[${new Date().toLocaleTimeString()}] ${message}`);
      state.log = state.log.slice(0, 200);
      notify();
    },
    setData(data, meta = {}) {
      const normalized = normalizeData(data);
      state.agents = normalized.agents;
      state.projects = normalized.projects;
      state.iterations = normalized.iterations;
      state.tasks = normalized.tasks;
      state.lastSyncedAt = new Date().toISOString();
      state.dataSource = meta.source ?? state.dataSource;
      state.syncWarning = meta.warning ?? null;

      const hasSelected = state.projects.some((project) => project.id === state.selectedProjectId);
      if (!hasSelected) {
        state.selectedProjectId = state.projects.find((project) => project.active)?.id ?? state.projects[0]?.id ?? null;
      }

      notify();
    }
  };
}
