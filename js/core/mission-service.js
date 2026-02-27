const events = [
  "Planner reprioritized project sequencing",
  "Builder picked up implementation queue",
  "Verifier initiated acceptance checks",
  "Publisher staged release notes"
];

export function createMissionService(store) {
  let pointer = 0;
  let timer;

  const runTick = () => {
    store.log(events[pointer % events.length]);
    pointer += 1;
  };

  return {
    simulate: runTick,
    setAutoAdvance(enabled) {
      if (enabled) {
        store.log("Auto-Advance enabled");
        timer = setInterval(runTick, 2500);
      } else {
        store.log("Auto-Advance disabled");
        clearInterval(timer);
      }
    }
  };
}
