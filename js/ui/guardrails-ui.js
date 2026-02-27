const checklistItems = [["objective", "Objective is explicit"], ["owner", "Owner assigned"], ["estimate", "Estimate captured"]];
const taskPattern = /^[A-Z]+-[A-Z]+-[A-Z0-9-]+$/;

export function mountGuardrails(store) {
  const taskNameInput = document.getElementById("task-name");
  const proofLinkInput = document.getElementById("proof-link");
  const proofButton = document.getElementById("proof-button");
  const checklist = document.getElementById("checklist");

  checklist.innerHTML = checklistItems.map(([key, label]) => `<li><input type="checkbox" id="chk-${key}"><label for="chk-${key}">${label}</label></li>`).join("");

  checklistItems.forEach(([key]) => {
    document.getElementById(`chk-${key}`).addEventListener("change", (e) => store.setChecklist(key, e.target.checked));
  });
  taskNameInput.addEventListener("input", (e) => store.setTaskName(e.target.value.trim()));
  proofLinkInput.addEventListener("input", (e) => store.setProofUrl(e.target.value.trim()));
  proofButton.addEventListener("click", () => store.log("Proof Gate validation checked"));

  store.subscribe((state) => {
    const nameStatus = document.getElementById("name-status");
    const proofStatus = document.getElementById("proof-status");

    const nameOk = taskPattern.test(state.taskName);
    const checklistOk = Object.values(state.checklist).every(Boolean);
    const proofOk = /^https:\/\//.test(state.proofUrl);
    const passed = nameOk && checklistOk && proofOk;

    nameStatus.textContent = nameOk ? "Name passes TEAM-ACTION-SCOPE format." : "Expected pattern: TEAM-ACTION-SCOPE (uppercase).";
    nameStatus.className = `status-text ${nameOk ? "status-ok" : "status-warn"}`;
    proofStatus.textContent = passed ? "Proof Gate passed. Task may proceed." : "Proof Gate blocked. Complete checklist + valid URL required.";
    proofStatus.className = `status-text ${passed ? "status-ok" : "status-bad"}`;
  });
}
