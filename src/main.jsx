import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const PWA_STATUS_EVENT = "dragon-scales:pwa-status";

function emitPwaStatus(type) {
  window.dispatchEvent(new CustomEvent(PWA_STATUS_EVENT, { detail: { type } }));
}

function wireServiceWorkerLifecycle(registration) {
  if (registration.waiting) {
    emitPwaStatus("update-available");
  }

  registration.addEventListener("updatefound", () => {
    const nextWorker = registration.installing;
    if (!nextWorker) {
      return;
    }

    nextWorker.addEventListener("statechange", () => {
      if (nextWorker.state !== "installed") {
        return;
      }

      emitPwaStatus(navigator.serviceWorker.controller ? "update-available" : "offline-ready");
    });
  });
}

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then((registration) => {
      wireServiceWorkerLifecycle(registration);
    }).catch(() => {
      return;
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
