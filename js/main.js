import { createStore } from "./core/store.js";
import { mountTabs } from "./ui/tabs.js";
import { mountDashboard } from "./ui/dashboard-ui.js";
import { mountMission } from "./ui/mission-ui.js";

const POLL_INTERVAL_MS = 2000;

async function loadLiveData(store) {
  const response = await fetch(`./data.json?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load data.json (${response.status})`);
  }

  const payload = await response.json();
  store.setData(payload);
}

function bootstrap() {
  const store = createStore();
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
      await loadLiveData(store);
    } catch (error) {
      store.log(`Live data refresh failed: ${error.message}`);
    }
  };

  refresh();
  setInterval(refresh, POLL_INTERVAL_MS);

  store.setView("dashboard");
}

document.addEventListener("DOMContentLoaded", bootstrap);
