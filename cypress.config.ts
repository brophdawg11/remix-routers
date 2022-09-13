import { defineConfig } from "cypress";

const library = process.cwd().split("/").slice(-1)[0].replace("-stub", "");
console.log(`Running Cypress integration tests for library: ${library}`);

module.exports = defineConfig({
  integrationFolder: "../../cypress/integration",
  fixturesFolder: false,
  pluginsFile: false,
  screenshotOnRunFailure: false,
  supportFile: false,
  video: false,
  env: {
    UI_LIBRARY: library,
  },
});
