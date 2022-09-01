import * as React from "react";
import * as ReactDOM from "react-dom/client";
import App from "~/App";

// @ts-expect-error
ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
