export function mountDashboard(store) {
  const statusList = document.getElementById("agent-status-list");
  const board = document.getElementById("project-board");
  const sidebar = document.getElementById("mission-sidebar");
  const toggleButton = document.getElementById("mission-sidebar-toggle");
  const dashboardGrid = document.querySelector(".dashboard-grid");

  toggleButton.addEventListener("click", () => store.toggleMissionSidebar());

  store.subscribe((state) => {
    statusList.innerHTML = state.agents
      .map(([name, online]) => `<li class="agent-pill"><span class="dot ${online ? "green" : ""}"></span><span class="agent-label">${name}</span></li>`)
      .join("");

    board.innerHTML = Object.entries(state.board)
      .map(([column, items]) => {
        const cards = items.map((item) => `<article class="card">${item}</article>`).join("");
        return `<section class="board-col"><h4>${column.charAt(0).toUpperCase() + column.slice(1)}</h4><div class="card-stack">${cards}</div></section>`;
      })
      .join("");

    dashboardGrid.classList.toggle("sidebar-collapsed", state.missionSidebarCollapsed);
    sidebar.classList.toggle("is-collapsed", state.missionSidebarCollapsed);
    toggleButton.textContent = state.missionSidebarCollapsed ? "▶" : "◀";
    toggleButton.setAttribute("title", state.missionSidebarCollapsed ? "Expand" : "Collapse");
    toggleButton.setAttribute("aria-label", state.missionSidebarCollapsed ? "Expand Mission Control" : "Collapse Mission Control");
  });
}
