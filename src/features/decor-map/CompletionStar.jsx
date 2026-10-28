import React from "react";
import completionStarUrl from "./completion-star.svg";

export default function CompletionStar() {
  return <img className="decor-map__completion-star" src={completionStarUrl} width="14" height="14" alt="Entire category collected" />;
}
