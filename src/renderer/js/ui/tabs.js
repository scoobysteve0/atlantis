import { VIEWS } from "../config/app-config.js";

export function mountTabs(store) {
  const host = document.getElementById("tabs");
  host.innerHTML = VIEWS.map(([id, label], i) => `<button class="tab ${i === 0 ? "is-active" : ""}" data-view="${id}">${label}</button>`).join("");

  host.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => store.setView(tab.dataset.view));
  });

  store.subscribe((state) => {
    host.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.view === state.activeView);
    });

    for (const [id] of VIEWS) {
      document.getElementById(`${id}-view`).classList.toggle("is-hidden", id !== state.activeView);
    }
  });
}
