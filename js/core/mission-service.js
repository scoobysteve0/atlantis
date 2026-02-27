import { BOARD_COLUMNS } from "../config/app-config.js";

const events = [
  "Planner validated scope",
  "Builder advanced implementation",
  "Verifier started checks",
  "Publisher prepared release notes"
];

export function createMissionService(store) {
  let pointer = 0;
  let timer;

  const runTick = () => {
    store.log(events[pointer % events.length]);
    store.appendBoard(BOARD_COLUMNS[pointer % BOARD_COLUMNS.length], `Auto task @ ${new Date().toLocaleTimeString()}`);
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
