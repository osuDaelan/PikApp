const emptyResult = () => ({ phase: "idle", places: [], message: "", truncated: false,
  incomplete: 0, hasScan: false, scannedBounds: null });

// A successful scan belongs to its requested area, not the moving viewport.
// Keep it until a replacement succeeds or its categories/source change.
export function createPlaceSearchSession(client) {
  let state = emptyResult(), contextKey = null, current = null, generation = 0;
  const listeners = new Set();
  function publish(next) { state = next; listeners.forEach(listener => listener()); }
  function abort() { generation++; current?.abort(); current = null; }
  function setContext({ categoryIds, sourceId }) {
    const key = JSON.stringify([[...categoryIds].sort(), sourceId]);
    if (key === contextKey) return;
    contextKey = key;
    abort();
    publish(emptyResult());
  }
  function cancel() {
    abort();
    publish({ ...state, phase: state.hasScan ? "success" : "idle", message: "" });
  }
  async function search({ bounds, categoryIds, sourceId }) {
    setContext({ categoryIds, sourceId });
    abort();
    const controller = new AbortController();
    current = controller;
    const request = generation;
    const requestedBounds = bounds ? [...bounds] : null;
    publish({ ...state, phase: "loading", message: "" });
    try {
      const data = await client.search({ bounds: requestedBounds, categoryIds: [...categoryIds], sourceId, signal: controller.signal });
      if (!controller.signal.aborted && generation === request) {
        publish({ ...data, phase: "success", message: "", hasScan: true, scannedBounds: requestedBounds });
      }
    } catch (error) {
      if (!controller.signal.aborted && generation === request) publish({ ...state, phase: "error", message: error.message });
    } finally {
      if (current === controller) current = null;
    }
  }
  return { getSnapshot: () => state,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
    setContext, search, cancel };
}
