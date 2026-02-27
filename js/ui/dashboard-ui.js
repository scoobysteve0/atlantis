export function mountDashboard(store) {
  const statusList = document.getElementById("agent-status-list");
  const board = document.getElementById("project-board");

  store.subscribe((state) => {
    statusList.innerHTML = state.agents
      .map(([name, online]) => `<li class="agent-pill"><span class="dot ${online ? "green" : ""}"></span>${name}</li>`)
      .join("");

    board.innerHTML = Object.entries(state.board)
      .map(([column, items]) => {
        const cards = items.map((item) => `<article class="card">${item}</article>`).join("");
        return `<section class="board-col"><h4>${column.charAt(0).toUpperCase() + column.slice(1)}</h4>${cards}</section>`;
      })
      .join("");
  });
}
