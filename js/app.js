import { initGuardrails } from "./modules/guardrails.js";
import { initDashboard, advanceBoard } from "./modules/dashboard.js";
import { initMissionControl } from "./modules/mission-control.js";

document.addEventListener("DOMContentLoaded", () => {
  initGuardrails();
  initDashboard();
  initMissionControl(advanceBoard);
  initTabs();
});

function initTabs() {
  const tabs = document.querySelectorAll(".tab");
  const views = {
    guardrails: document.getElementById("guardrails-view"),
    dashboard: document.getElementById("dashboard-view"),
    mission: document.getElementById("mission-view")
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      Object.entries(views).forEach(([name, view]) => {
        view.classList.toggle("is-hidden", name !== tab.dataset.view);
      });
    });
  });
}
