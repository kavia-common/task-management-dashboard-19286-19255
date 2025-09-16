import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// Create React App entry point with React 18 root API
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
