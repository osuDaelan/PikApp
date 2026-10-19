import { createContext } from "react";
import { SPARKLE_DEAD_ZONE } from "./sparkleLayout.js";

// Debug overrides affect new bursts; production uses the default geometry.
export default createContext(SPARKLE_DEAD_ZONE);
