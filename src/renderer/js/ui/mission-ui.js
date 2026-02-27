export function mountMission(store) {
  const list = document.getElementById("iterations-tab-list");

  if (!list) return;

  store.subscribe((state) => {
    const iterations = Array.isArray(state.iterations) ? state.iterations : [];
    list.innerHTML = iterations
      .map(
        (iteration) => `
          <li>
            <div class="iteration-row">
              <strong>${iteration.name}</strong>
              <span>${iteration.status}</span>
            </div>
            <small>${iteration.focus ?? "Internal improvement initiative"}</small>
          </li>
        `
      )
      .join("") || "<li>No iterations available.</li>";
  });
}
