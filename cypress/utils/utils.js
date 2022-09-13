function conditionalDescribe(opts, description, cb) {
  let library = Cypress.env("UI_LIBRARY");
  if (!library) {
    throw new Error(
      "Cypress tests must be run with the env.UI_LIBRARY configuration value set"
    );
  }
  if (opts[library] === false) {
    console.warn(`Skipping test suite for ${library}: ${description}`);
    describe.skip(description, () => cb({ library }));
  } else {
    describe(description, () => cb({ library }));
  }
}

module.exports = {
  conditionalDescribe,
};
