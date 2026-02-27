const statusToDot = {
  primed: "green",
  idle: "",
  duty: "red"
};

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
      .map((agent) => `
        <li class="agent-card">
          <div class="agent-meta">
            <span class="dot ${statusToDot[agent.status] ?? ""}"></span>
            <span class="agent-role">${agent.role}</span>
          </div>
          <span class="agent-copy">${agent.name} · ${agent.status === "primed" ? "Primed" : agent.status === "duty" ? "Duty" : "Idle"}</span>
        </li>
      `)
      .join("");

    const activeProjects = state.projects.filter((project) => project.active);
    board.innerHTML = activeProjects
      .map((project) => `
        <article class="project-card ${project.id === state.selectedProjectId ? "is-selected" : ""}" data-project-id="${project.id}">
          <h4 class="project-name">${project.name}</h4>
          <span class="project-wave ${project.active ? "is-active" : "is-inactive"}">${projectWaveLabel[project.status] ?? project.status}</span>
        </article>
      `)
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
