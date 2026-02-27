const events = [
  "Planner validated scope",
  "Builder advanced implementation",
  "Verifier started checks",
  "Publisher prepared release notes"
];

const steps = ["backlog", "active", "review", "done"];
let pointer = 0;
let autoTimer;

export function initMissionControl(onAdvance) {
  const toggle = document.getElementById("auto-advance-toggle");
  const trigger = document.getElementById("log-activity-button");

  trigger.addEventListener("click", () => {
    logEvent(events[pointer % events.length]);
    onAdvance?.(steps[pointer % steps.length]);
    pointer += 1;
  });

  toggle.addEventListener("change", (event) => {
    if (event.target.checked) {
      logEvent("Auto-Advance enabled");
      autoTimer = setInterval(() => trigger.click(), 2500);
    } else {
      logEvent("Auto-Advance disabled");
      clearInterval(autoTimer);
    }
  });
}

function logEvent(message) {
  const log = document.getElementById("live-log");
  const line = document.createElement("p");
  line.className = "log-line";
  line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  log.prepend(line);
}
