import React from "react";
import ReactDOM from "react-dom/client";
import { AppShell } from "./app/AppShell";
import "./styles/app.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppShell>
      <p>Explorador de conocimiento en preparación.</p>
    </AppShell>
  </React.StrictMode>
);
