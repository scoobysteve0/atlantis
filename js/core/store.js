import { BOARD_COLUMNS } from "../config/app-config.js";

export function createStore() {
  const state = {
    activeView: "guardrails",
    taskName: "",
    checklist: { objective: false, owner: false, estimate: false },
    proofUrl: "",
    board: {
      backlog: ["Define release criteria", "Create design tokens"],
      active: ["Implement Guardrails", "Wire board state"],
      review: ["QA smoke pass"],
      done: ["v1.3 baseline reset"]
    },
    agents: [["Planner", true], ["Builder", true], ["Verifier", false], ["Publisher", true]],
    log: []
  };

  const listeners = new Set();
  const notify = () => listeners.forEach((cb) => cb(state));

  return {
    getState: () => state,
    subscribe: (cb) => (listeners.add(cb), () => listeners.delete(cb)),
    setView(view) { state.activeView = view; notify(); },
    setTaskName(value) { state.taskName = value; notify(); },
    setChecklist(key, value) { state.checklist[key] = value; notify(); },
    setProofUrl(value) { state.proofUrl = value; notify(); },
    appendBoard(column, card) {
      if (!BOARD_COLUMNS.includes(column)) return;
      state.board[column].push(card);
      notify();
    },
    log(message) {
      state.log.unshift(`[${new Date().toLocaleTimeString()}] ${message}`);
      state.log = state.log.slice(0, 200);
      notify();
    }
  };
}
