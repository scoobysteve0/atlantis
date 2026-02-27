const statusToDot = {
  primed: "green",
  idle: "",
  duty: "red"
};

function sortByCompletion(tasks) {
  return [...tasks].sort((a, b) => Number(a.completed) - Number(b.completed));
}

function renderTaskList(tasks) {
  return sortByCompletion(tasks)
    .map((task) => {
      const statusClass = task.active ? "green" : "red";
      return `
        <li class="task-item ${task.completed ? "done" : ""}" data-task-id="${task.id}">
          <span class="dot ${statusClass}" title="${task.active ? "Active" : "Not Active"}"></span>
          <div class="task-content">
            <span class="task-text">${task.text}</span>
            <span class="task-agent">Assigned: ${task.agent}</span>
          </div>
        </li>
      `;
    })
    .join("");
}

export function mountDashboard(store) {
  const statusList = document.getElementById("agent-status-list");
  const board = document.getElementById("project-board");
  const ideasList = document.getElementById("ideas-list");
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
    const selected = state.projects.find((p) => p.id === state.selectedProjectId);
    const task = selected?.tasks.find((t) => t.id === item.dataset.taskId);
    if (!selected || !task) return;

    const nextCompleted = !task.completed;
    store.setTaskCompleted(selected.id, task.id, nextCompleted);
    store.setTaskActive(selected.id, task.id, nextCompleted ? false : true);
  });

  store.subscribe((state) => {
    statusList.innerHTML = state.agents
      .map((agent) => `
        <li class="agent-card">
          <div class="agent-meta">
            <span class="dot ${statusToDot[agent.status]}"></span>
            <span class="agent-role">${agent.role}</span>
          </div>
          <span class="agent-copy">${agent.model} · ${agent.status === "primed" ? "Primed" : agent.status === "duty" ? "Duty" : "Idle"}</span>
        </li>
      `)
      .join("");

    board.innerHTML = state.projects
      .map((project) => `
        <article class="project-card ${project.id === state.selectedProjectId ? "is-selected" : ""}" data-project-id="${project.id}">
          <h4 class="project-name">${project.name}</h4>
          <span class="project-wave">${project.waveLabel}</span>
        </article>
      `)
      .join("");

    ideasList.innerHTML = state.ideas.map((idea) => `<li>${idea}</li>`).join("");

    const selected = state.projects.find((p) => p.id === state.selectedProjectId) ?? state.projects[0];
    const agentTasks = selected.tasks.filter((task) => task.source === "agent");
    const userTasks = selected.tasks.filter((task) => task.source === "user");

    detail.innerHTML = `
      <div class="detail-header">
        <h3>${selected.name}</h3>
        <span class="detail-sub">Task Detail View</span>
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
