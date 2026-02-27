const boardData = {
  backlog: ["Define release criteria", "Create design tokens"],
  active: ["Implement Guardrails", "Wire board state"],
  review: ["QA smoke pass"],
  done: ["v1.3 baseline reset"]
};

const agents = [
  ["Planner", true],
  ["Builder", true],
  ["Verifier", false],
  ["Publisher", true]
];

export function initDashboard() {
  renderAgentStatus();
  renderBoard();
}

export function advanceBoard(column) {
  if (!boardData[column]) return;
  boardData[column].push(`Auto task @ ${new Date().toLocaleTimeString()}`);
  renderBoard();
}

function renderAgentStatus() {
  const statusList = document.getElementById("agent-status-list");
  statusList.innerHTML = agents
    .map(([name, online]) => `<li class="agent-pill"><span class="dot ${online ? "green" : ""}"></span>${name}</li>`)
    .join("");
}

function renderBoard() {
  const board = document.getElementById("project-board");
  board.innerHTML = Object.entries(boardData)
    .map(([column, items]) => {
      const cards = items.map((item) => `<article class="card">${item}</article>`).join("");
      return `<section class="board-col"><h4>${toTitle(column)}</h4>${cards}</section>`;
    })
    .join("");
}

function toTitle(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
