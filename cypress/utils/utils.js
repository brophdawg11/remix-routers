function conditionalDescribe(opts, description, cb) {
  let library = Cypress.env("UI_LIBRARY");
  if (!library) {
    throw new Error(
      "Cypress tests must be run with the CYPRESS_UI_LIBRARY environment variable set"
    );
  }
  if (opts[library] === false) {
    console.warn(`Skipping test suite for ${library}: ${description}`);
    describe.skip(description, cb);
  } else {
    describe(description, cb);
  }
}

module.exports = {
  conditionalDescribe,
};
