import React from "react";
import ReactDOM from "react-dom/client";

import { Bootstrap } from "./app/Bootstrap";
import "./styles/app.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Bootstrap />
  </React.StrictMode>,
);
