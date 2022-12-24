import { defineConfig } from "cypress";
import { parse } from "node:path";

const library = parse(process.cwd()).name.replace("-stub", "");
console.log(`Running Cypress integration tests for library: ${library}`);

module.exports = defineConfig({
  integrationFolder: "../../cypress/integration",
  fixturesFolder: false,
  pluginsFile: false,
  supportFile: false,
  video: false,
  env: {
    UI_LIBRARY: library,
  },
});
