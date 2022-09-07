import * as Preact from "preact";
import App from "~/App";

// @ts-expect-error
Preact.hydrate(<App />, document.getElementById("app"));
