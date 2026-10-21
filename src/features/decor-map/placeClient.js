import { buildOverpassQuery, normalizeOsmResults } from "./osm.js";
import { DATA_SOURCES } from "./providers.js";
export { DATA_SOURCES } from "./providers.js";

const CACHE_MS = 5 * 60 * 1000;

export function createPlaceClient({ fetcher = (...args) => fetch(...args), now = Date.now, timeoutMs = 25000 } = {}) {
  const cache = new Map();
  let lastRequest = -Infinity;
  return {
    async search({ categoryIds, bounds, sourceId, signal }) {
      const source = DATA_SOURCES.find(item => item.id === sourceId);
      if (!source) throw new Error("Choose a supported map data source.");
      const query = buildOverpassQuery(categoryIds, bounds);
      const key = `${source.id}:${query}`;
      const previous = cache.get(key);
      if (previous && now() - previous.fetchedAt < CACHE_MS) return { ...previous, cached: true };
      if (now() - lastRequest < 5000) throw new Error("Please wait a few seconds before searching again.");
      if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
      lastRequest = now();
      const controller = new AbortController();
      const cancel = () => controller.abort();
      signal?.addEventListener("abort", cancel, { once: true });
      let timedOut = false;
      const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
      try {
        const response = await fetcher(source.url, { method: "POST", signal: controller.signal,
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8", Accept: "application/json" },
          body: new URLSearchParams({ data: query }).toString() });
        if (!response.ok) {
          if ([429, 502, 503, 504].includes(response.status)) throw new Error("This map data source is busy. Wait a moment, zoom in, or try the other source.");
          throw new Error(`The map data source could not answer (${response.status}). Try again or use the other source.`);
        }
        if (Number(response.headers?.get("content-length")) > 12 * 1024 * 1024) throw new Error("Too much map data. Zoom in and try again.");
        const data = await response.json();
        if (controller.signal.aborted) throw new DOMException("Cancelled", "AbortError");
        const result = { ...normalizeOsmResults(data, categoryIds), fetchedAt: now(), cached: false };
        cache.set(key, result);
        while (cache.size > 12) cache.delete(cache.keys().next().value);
        return result;
      } catch (error) {
        if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
        if (timedOut) throw new Error("The map search timed out. Zoom in or try the other data source.");
        if (error instanceof TypeError) throw new Error("Cannot reach the map data source. Check your connection or try the other source.");
        throw error;
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener("abort", cancel);
      }
    },
  };
}

export const placeClient = createPlaceClient();
