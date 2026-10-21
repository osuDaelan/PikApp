import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

async function start() {
  if (import.meta.env.DEV) {
    try {
      const { restoreLocalCalculatorBackup } = await import("./storage/localCalculatorBackup.js");
      await restoreLocalCalculatorBackup();
    } catch (error) { console.warn("Local calculator backup could not be restored:", error.message); }
  }
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
start();
