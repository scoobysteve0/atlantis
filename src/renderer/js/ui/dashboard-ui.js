const statusToDot = {
  primed: "green",
  idle: "",
  duty: "red",
  "working on v3.3": "red"
};

function formatAgentStatus(status = "idle") {
  if (status === "primed") return "Primed";
  if (status === "duty") return "Duty";
  if (status === "idle") return "Idle";
  return status;
}

function formatLastSynced(isoStamp) {
  if (!isoStamp) return "Waiting for live data…";
  const deltaSeconds = Math.max(0, Math.floor((Date.now() - new Date(isoStamp).getTime()) / 1000));
  if (deltaSeconds < 5) return "Just now";
  if (deltaSeconds < 60) return `${deltaSeconds}s ago`;
  return `${Math.floor(deltaSeconds / 60)}m ago`;
}

function formatDataSource(source = "boot") {
  if (source === "openclaw-live") return "OpenClaw Live";
  if (source === "mock-json") return "Mock JSON";
  if (source === "cached") return "Cached Snapshot";
  return "Booting";
}

const projectWaveLabel = {
  active: "In Motion",
  "in-progress": "In Motion",
  planned: "Planned",
  future: "Future",
  idle: "Idle",
  blocked: "Blocked"
};

function sortByCompletion(tasks) {
  return [...tasks].sort((a, b) => Number(a.completed) - Number(b.completed));
}

function renderTaskList(tasks) {
  return sortByCompletion(tasks)
    .map((task) => {
      const statusClass = task.completed ? "" : task.status === "in-progress" ? "green" : task.status === "blocked" ? "red" : "";
      return `
        <li class="task-item ${task.completed ? "done" : ""}" data-task-id="${task.id}">
          <span class="dot ${statusClass}" title="${task.status}"></span>
          <div class="task-content">
            <span class="task-text">${task.description}</span>
            <span class="task-agent">Assigned: ${task.assignedTo}</span>
          </div>
        </li>
      `;
    })
    .join("");
}

export function mountDashboard(store) {
  const statusList = document.getElementById("agent-status-list");
  const board = document.getElementById("project-board");
  const iterationsList = document.getElementById("iterations-list");
  const lastSynced = document.getElementById("last-synced");
  const healthBadge = document.getElementById("data-health");
  const syncWarning = document.getElementById("sync-warning");
  const detail = document.getElementById("project-detail");
  const sidebar = document.getElementById("mission-sidebar");
  const toggleButton = document.getElementById("mission-sidebar-toggle");
  const dashboardGrid = document.querySelector(".dashboard-grid");

  toggleButton.addEventListener("click", () => store.toggleMissionSidebar());

  board.addEventListener("click", (event) => {
    const card = event.target.closest(".project-card");
    if (!card) return;
    store.selectProject(card.dataset.projectId);
  });

  detail.addEventListener("click", (event) => {
    const item = event.target.closest(".task-item");
    if (!item) return;

    const state = store.getState();
    const task = state.tasks.find((t) => t.id === item.dataset.taskId);
    if (!task) return;

    const nextCompleted = !task.completed;
    store.setTaskCompleted(task.id, nextCompleted);
    store.setTaskStatus(task.id, nextCompleted ? "complete" : "in-progress");
  });

  store.subscribe((state) => {
    statusList.innerHTML = state.agents
      .map((agent) => {
        const normalizedStatus = String(agent.status ?? "idle").toLowerCase();
        return `
        <li class="agent-card">
          <div class="agent-meta">
            <span class="dot ${statusToDot[normalizedStatus] ?? ""}"></span>
            <span class="agent-role">${agent.role}</span>
          </div>
          <span class="agent-copy">${agent.name} · ${formatAgentStatus(agent.status)}</span>
        </li>
      `;
      })
      .join("");

    if (lastSynced) {
      lastSynced.textContent = `Last Sync: ${formatLastSynced(state.lastSyncedAt)}`;
    }
    if (healthBadge) {
      healthBadge.textContent = `Source: ${formatDataSource(state.dataSource)}`;
      healthBadge.classList.toggle("is-live", state.dataSource === "openclaw-live");
      healthBadge.classList.toggle("is-fallback", state.dataSource !== "openclaw-live");
    }
    if (syncWarning) {
      syncWarning.textContent = state.syncWarning || "";
      syncWarning.classList.toggle("is-hidden", !state.syncWarning);
    }

    const activeProjects = state.projects.filter((project) => project.active);
    board.innerHTML = activeProjects
      .map((project) => {
        const spotlightClass = ["atlantis", "nebula-sync"].includes(project.id) ? "is-spotlight" : "";
        return `
        <article class="project-card ${spotlightClass} ${project.id === state.selectedProjectId ? "is-selected" : ""}" data-project-id="${project.id}">
          <h4 class="project-name">${project.name}</h4>
          <span class="project-wave ${project.active ? "is-active" : "is-inactive"}">${projectWaveLabel[project.status] ?? project.status}</span>
        </article>
      `;
      })
      .join("");

    const iterations = Array.isArray(state.iterations) ? state.iterations : [];
    iterationsList.innerHTML = iterations
      .map((iteration) => `
        <li>
          <div class="iteration-row">
            <strong>${iteration.name}</strong>
            <span>${projectWaveLabel[iteration.status] ?? iteration.status}</span>
          </div>
          <small>${iteration.focus ?? "Internal improvement initiative"}</small>
        </li>
      `)
      .join("") || "<li>No iterations queued.</li>";

    const selected = state.projects.find((p) => p.id === state.selectedProjectId) ?? activeProjects[0] ?? state.projects[0];
    if (!selected) {
      detail.innerHTML = "<p class=\"detail-sub\">No projects found in live data.</p>";
      return;
    }

    const selectedTasks = state.tasks.filter((task) => task.projectId === selected.id);
    const agentTasks = selectedTasks.filter((task) => task.type === "agent");
    const userTasks = selectedTasks.filter((task) => task.type === "user");

    detail.innerHTML = `
      <div class="detail-header">
        <h3>${selected.name}</h3>
        <span class="detail-sub">Live Task Detail View</span>
      </div>
      <div class="task-group">
        <h4>Agent-Created Tasks</h4>
        <ul class="task-list">${renderTaskList(agentTasks)}</ul>
      </div>
      <div class="task-group">
        <h4>User-Created Tasks</h4>
        <ul class="task-list">${renderTaskList(userTasks)}</ul>
      </div>
    `;

    dashboardGrid.classList.toggle("sidebar-collapsed", state.missionSidebarCollapsed);
    sidebar.classList.toggle("is-collapsed", state.missionSidebarCollapsed);
    toggleButton.textContent = state.missionSidebarCollapsed ? "▶" : "◀";
    toggleButton.setAttribute("title", state.missionSidebarCollapsed ? "Expand" : "Collapse");
    toggleButton.setAttribute("aria-label", state.missionSidebarCollapsed ? "Expand Agents" : "Collapse Agents");
  });
}
