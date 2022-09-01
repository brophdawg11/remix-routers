import * as React from "react";
// @ts-expect-error
import * as ReactDOM from "react-dom/client";
import App from "~/App";

ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
