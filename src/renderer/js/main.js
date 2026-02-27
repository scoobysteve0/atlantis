import { createStore } from "./core/store.js";
import { createDataService } from "./core/data-service.js";
import { mountTabs } from "./ui/tabs.js";
import { mountDashboard } from "./ui/dashboard-ui.js";
import { mountMission } from "./ui/mission-ui.js";

const POLL_INTERVAL_MS = 4000;

function bootstrap() {
  const store = createStore();
  const dataService = createDataService();

  mountTabs(store);
  mountDashboard(store);
  mountMission(store);

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

  const refresh = async () => {
    try {
      const { payload, source, warning } = await dataService.load();
      store.setData(payload, { source, warning });
    } catch (error) {
      store.log(`Live data refresh failed: ${error.message}`);
    }
  };

  refresh();
  setInterval(refresh, POLL_INTERVAL_MS);

  store.setView("dashboard");
}

document.addEventListener("DOMContentLoaded", bootstrap);
