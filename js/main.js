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

  // initial paint
  store.setView("guardrails");
}

document.addEventListener("DOMContentLoaded", bootstrap);
