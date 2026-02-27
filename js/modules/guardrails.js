import { state, taskPattern } from "./state.js";

const checklistItems = [
  ["objective", "Objective is explicit"],
  ["owner", "Owner assigned"],
  ["estimate", "Estimate captured"]
];

export function initGuardrails() {
  const taskNameInput = document.getElementById("task-name");
  const proofLinkInput = document.getElementById("proof-link");
  const proofButton = document.getElementById("proof-button");
  const checklist = document.getElementById("checklist");

  checklistItems.forEach(([key, label]) => {
    const li = document.createElement("li");
    li.innerHTML = `<input type="checkbox" id="chk-${key}"><label for="chk-${key}">${label}</label>`;
    checklist.append(li);
    li.querySelector("input").addEventListener("change", (event) => {
      state.checklist[key] = event.target.checked;
      renderStatus();
    });
  });

  taskNameInput.addEventListener("input", (event) => {
    state.taskName = event.target.value.trim();
    renderStatus();
  });

  proofLinkInput.addEventListener("input", (event) => {
    state.proofUrl = event.target.value.trim();
    renderStatus();
  });

  proofButton.addEventListener("click", renderStatus);

  renderStatus();
}

function renderStatus() {
  const nameStatus = document.getElementById("name-status");
  const proofStatus = document.getElementById("proof-status");

  const nameOk = taskPattern.test(state.taskName);
  const checklistOk = Object.values(state.checklist).every(Boolean);
  const proofOk = /^https:\/\//.test(state.proofUrl);

  nameStatus.textContent = nameOk
    ? "Name passes TEAM-ACTION-SCOPE format."
    : "Expected pattern: TEAM-ACTION-SCOPE (uppercase).";
  nameStatus.className = `status-text ${nameOk ? "status-ok" : "status-warn"}`;

  const passed = nameOk && checklistOk && proofOk;
  proofStatus.textContent = passed
    ? "Proof Gate passed. Task may proceed."
    : "Proof Gate blocked. Complete checklist + valid URL required.";
  proofStatus.className = `status-text ${passed ? "status-ok" : "status-bad"}`;
}
