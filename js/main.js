import { createStore } from "./core/store.js";
import { createMissionService } from "./core/mission-service.js";
import { mountTabs } from "./ui/tabs.js";
import { mountDashboard } from "./ui/dashboard-ui.js";
import { mountMission } from "./ui/mission-ui.js";

function bootstrap() {
  const store = createStore();
  const missionService = createMissionService(store);

  mountTabs(store);
  mountDashboard(store);
  mountMission(store, missionService);

  const settingsButton = document.getElementById("settings-button");
  const modal = document.getElementById("app-modal");
  const modalMessage = document.getElementById("app-modal-message");
  const modalClose = document.getElementById("app-modal-close");

  settingsButton.addEventListener("click", () => {
    modalMessage.textContent = "Settings panel coming soon. Preferences and theme controls will live here.";
    modal.classList.remove("is-hidden", "closing");
  });

  modalClose.addEventListener("click", () => {
    modal.classList.add("is-hidden");
  });

  store.setView("dashboard");
}

document.addEventListener("DOMContentLoaded", bootstrap);
