import { useEffect, useRef, useState } from "react";
import { placeClient } from "./placeClient.js";

const emptyResult = () => ({ phase: "idle", places: [], message: "", truncated: false, incomplete: 0 });

export default function usePlaceSearch({ bounds, categoryIds, sourceId }) {
  const [result, setResult] = useState(emptyResult);
  const current = useRef(null);
  const generation = useRef(0);
  const key = JSON.stringify([bounds?.map(n => Number(n.toFixed(5))), [...categoryIds].sort(), sourceId]);
  useEffect(() => {
    generation.current++;
    current.current?.abort();
    setResult(emptyResult());
    return () => { generation.current++; current.current?.abort(); };
  }, [key]);
  async function search() {
    current.current?.abort();
    const controller = new AbortController();
    current.current = controller;
    const request = ++generation.current;
    setResult({ ...emptyResult(), phase: "loading" });
    try {
      const data = await placeClient.search({ bounds, categoryIds, sourceId, signal: controller.signal });
      if (!controller.signal.aborted && generation.current === request) setResult({ ...data, phase: "success", message: "" });
    } catch (error) {
      if (!controller.signal.aborted && generation.current === request) setResult({ ...emptyResult(), phase: "error", message: error.message });
    }
  }
  function cancel() {
    generation.current++;
    current.current?.abort();
    setResult(emptyResult());
  }
  return { ...result, search, cancel };
}
