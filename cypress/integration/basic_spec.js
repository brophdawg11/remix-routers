/// <reference types="cypress" />

const { conditionalDescribe } = require("../utils/utils");

function testJson(selector, cb) {
  cy.get(selector).should(($el) => cb(JSON.parse($el.text())));
}

function assertValue(actual, expected) {
  if (Array.isArray(expected)) {
    expect(actual.length).to.equal(expected.length);
    expected.forEach((v, i) => assertValue(actual[i], v));
  } else if (expected == null) {
    expect(actual === expected).to.equal(true);
  } else if (typeof expected === "object") {
    Object.entries(expected).forEach(([k, v]) => assertValue(actual[k], v));
  } else {
    // Assume primitive
    expect(actual).to.equal(expected);
  }
}

function assertHooks(hooks) {
  Object.entries(hooks).forEach(([hookName, hookValue]) => {
    testJson(`#${hookName}`, (renderedValue) => {
      assertValue(renderedValue, hookValue);
    });
  });
}

conditionalDescribe(
  { react: true, vue: true, svelte: true },
  "Basic Navigation",
  ({ library }) => {
    beforeEach(() => {
      cy.visit("http://localhost:3000/");
    });

    it("displays the index page and router info", () => {
      cy.get("h1").should("have.text", `Root Layout (${library})`);
      cy.get("h2").should("have.text", "Index Page");

      assertHooks({
        navigationType: "POP",
        location: { pathname: "/" },
        navigation: { state: "idle" },
        matches: [
          { id: "0", pathname: "/", params: {} },
          { id: "0-0", pathname: "/", params: {} },
        ],
      });
    });

    it("navigates to /parent and /parent/child", () => {
      // Navigate to parent
      cy.get("a[href='/parent']").click();

      // Location stays on source page during navigation
      cy.get("h2").should("have.text", "Index Page");

      assertHooks({
        navigationType: "POP",
        navigation: {
          state: "loading",
          location: { pathname: "/parent" },
        },
        location: { pathname: "/" },
      });

      // Location updates once navigation completes
      cy.get("h2").should("have.text", "Parent Layout");
      cy.get("p#parent").should("have.text", "Parent data: parent loader data");

      assertHooks({
        navigationType: "PUSH",
        navigation: {
          state: "idle",
          location: undefined,
        },
        location: { pathname: "/parent" },
        matches: [
          { id: "0", pathname: "/", params: {} },
          {
            id: "0-1",
            pathname: "/parent",
            params: {},
            data: { data: "parent loader data" },
          },
        ],
      });

      // Navigate to /parent/child
      cy.get("a[href='/parent/child']").click();

      // Location stays on source page during navigation
      cy.get("h2").should("have.text", "Parent Layout");

      assertHooks({
        navigationType: "PUSH",
        navigation: {
          state: "loading",
          location: { pathname: "/parent/child" },
        },
        location: { pathname: "/parent" },
      });

      // Location updates once navigation completes
      cy.get("h2").should("have.text", "Parent Layout");
      cy.get("h3").should("have.text", "Child Route");
      cy.get("p#parent").should("have.text", "Parent data: parent loader data");
      cy.get("p#child").should("have.text", "Child data: child loader data");

      assertHooks({
        navigationType: "PUSH",
        navigation: {
          state: "idle",
          location: undefined,
        },
        location: { pathname: "/parent/child" },
        matches: [
          { id: "0", pathname: "/", params: {} },
          {
            id: "0-1",
            pathname: "/parent",
            params: {},
            data: { data: "parent loader data" },
          },
          {
            id: "0-1-0",
            pathname: "/parent/child",
            params: {},
            data: { data: "child loader data" },
          },
        ],
      });

      // Go back to /parent
      cy.get("button#back").click();

      // Location updates once navigation completes
      cy.get("h2").should("have.text", "Parent Layout");
      cy.get("p#parent").should("have.text", "Parent data: parent loader data");
      cy.get("p#child").should("not.exist");

      assertHooks({
        navigationType: "POP",
        navigation: {
          state: "idle",
          location: undefined,
        },
        location: { pathname: "/parent" },
        matches: [
          { id: "0", pathname: "/", params: {} },
          {
            id: "0-1",
            pathname: "/parent",
            params: {},
            data: { data: "parent loader data" },
          },
        ],
      });
    });
  }
);
