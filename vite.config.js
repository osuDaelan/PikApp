import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import localCalculatorBackup from "./dev/localCalculatorBackup.js";

export default defineConfig({
  plugins: [react(), localCalculatorBackup()],
});
