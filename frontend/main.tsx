import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Unregister any stale Service Worker registered by previous projects on localhost
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

// Clean up Google OAuth access token hash from URL if present
if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
  window.history.replaceState(null, "", window.location.pathname);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
