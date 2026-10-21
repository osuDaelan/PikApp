import { useEffect, useState, useSyncExternalStore } from "react";
import { placeClient } from "./placeClient.js";
import { createPlaceSearchSession } from "./placeSearchSession.js";

export default function usePlaceSearch({ bounds, categoryIds, sourceId }) {
  const [session] = useState(() => createPlaceSearchSession(placeClient));
  const result = useSyncExternalStore(session.subscribe, session.getSnapshot);
  const contextKey = JSON.stringify([[...categoryIds].sort(), sourceId]);
  useEffect(() => { session.setContext({ categoryIds, sourceId }); }, [session, contextKey]);
  useEffect(() => () => session.cancel(), [session]);
  return { ...result, search: () => session.search({ bounds, categoryIds, sourceId }), cancel: session.cancel };
}
