const MOCK_PATHS = ["./data.json", "./src/renderer/data.json"];
const CACHE_KEY = "atlantis.cachedPayload.v34";

async function fetchJson(url) {
  const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${url} (${response.status})`);
  }
  return response.json();
}

async function tryMockData() {
  for (const path of MOCK_PATHS) {
    try {
      return await fetchJson(path);
    } catch {
      // continue fallback list
    }
  }

  throw new Error("No mock data source available");
}

export function createDataService() {
  return {
    async load() {
      try {
        const payload = window.electronAPI?.readData ? await window.electronAPI.readData() : await tryMockData();
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
        return {
          payload,
          source: "mock-json",
          warning: "Using mock JSON bridge (API wiring scaffold ready)."
        };
      } catch (mockError) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          return {
            payload: JSON.parse(cached),
            source: "cached",
            warning: `Mock bridge unavailable (${mockError.message}). Using cached snapshot.`
          };
        }

        throw mockError;
      }
    }
  };
}
