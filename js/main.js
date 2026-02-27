import { createStore } from "./core/store.js";
import { createMissionService } from "./core/mission-service.js";
import { mountTabs } from "./ui/tabs.js";
import { mountGuardrails } from "./ui/guardrails-ui.js";
import { mountDashboard } from "./ui/dashboard-ui.js";
import { mountMission } from "./ui/mission-ui.js";

function bootstrap() {
  const store = createStore();
  const missionService = createMissionService(store);

  mountTabs(store);
  mountGuardrails(store);
  mountDashboard(store);
  mountMission(store, missionService);

  const settingsButton = document.getElementById("settings-button");
  const modal = document.getElementById("app-modal");
  const modalMessage = document.getElementById("app-modal-message");

  settingsButton.addEventListener("click", () => {
    modalMessage.textContent = "Settings panel coming soon. Preferences and theme controls will live here.";
    modal.classList.remove("is-hidden", "closing");
  });

  // initial paint
  store.setView("guardrails");
}

document.addEventListener("DOMContentLoaded", bootstrap);
