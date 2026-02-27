export function mountMission(store, missionService) {
  const toggle = document.getElementById("auto-advance-toggle");
  const trigger = document.getElementById("log-activity-button");
  const log = document.getElementById("live-log");

  toggle.addEventListener("change", (e) => missionService.setAutoAdvance(e.target.checked));
  trigger.addEventListener("click", () => missionService.simulate());

  store.subscribe((state) => {
    log.innerHTML = state.log.map((line) => `<p class="log-line">${line}</p>`).join("");
  });
}
