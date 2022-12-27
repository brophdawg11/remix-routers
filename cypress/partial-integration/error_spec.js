/// <reference types="cypress" />
const { conditionalDescribe } = require("../utils/utils");

conditionalDescribe(
  { react: true, vue: true, svelte: false },
  "Error Handling",
  ({ library }) => {
    beforeEach(() => {
      cy.visit("http://localhost:3000/");
    });

    it("handles loader errors with a default error boundary", () => {
      cy.get("a[href='/error?type=loader']").click();

      cy.get("h2").should("have.text", "Unhandled Thrown Error!");
      cy.get("h3").should("contain.text", "Loader error!");
      cy.get("pre").should("contain.text", "Error: Loader error!");
      cy.get("p").should("contain.text", "💿 Hey developer 👋");

      // Ensure we can recover
      cy.go("back");

      cy.get("h1").should("have.text", `Root Layout (${library})`);
      cy.get("h2").should("have.text", "Index Page");
    });

    it("handles render errors with a default error boundary", () => {
      // React still bubbles the error to window.onerror even if it's handled by
      // a boundary, so need this to prevent that from triggering a cypress
      // failure.  See https://github.com/cypress-io/cypress/issues/7196
      cy.on("uncaught:exception", () => false);

      cy.get("a[href='/error?type=render']").click();

      cy.get("h2").should("have.text", "Unhandled Thrown Error!");
      cy.get("h3").should(
        "contain.text",
        "Cannot read properties of undefined (reading 'bar')"
      );
      cy.get("pre").should(
        "contain.text",
        "TypeError: Cannot read properties of undefined (reading 'bar')"
      );
      cy.get("p").should("contain.text", "💿 Hey developer 👋");

      // Ensure we can recover
      cy.go("back");

      cy.get("h1").should("have.text", `Root Layout (${library})`);
      cy.get("h2").should("have.text", "Index Page");
    });

    it("handles loader errors with a provided errorElement", () => {
      cy.get("a[href='/parent/error?type=loader']").click();

      cy.get("h2").should("have.text", "Application Error Boundary");
      cy.get("p").should("contain.text", "Loader error!");
      cy.get("a[href='/']").should("contain.text", "Go home");

      // Ensure we can recover
      cy.go("back");

      cy.get("h1").should("have.text", `Root Layout (${library})`);
      cy.get("h2").should("have.text", "Index Page");
    });

    it("handles render errors with a provided errorElement", () => {
      // React still bubbles the error to window.onerror even if it's handled by
      // a boundary, so need this to prevent that from triggering a cypress
      // failure.  See https://github.com/cypress-io/cypress/issues/7196
      cy.on("uncaught:exception", () => false);

      cy.get("a[href='/parent/error?type=render']").click();

      cy.get("h2").should("have.text", "Application Error Boundary");
      cy.get("p").should(
        "contain.text",
        "Cannot read properties of undefined (reading 'bar')"
      );

      // We should still be rendering the root layout
      cy.get("h1").should("have.text", `Root Layout (${library})`);

      // Ensure we can recover
      cy.go("back");

      cy.get("h1").should("have.text", `Root Layout (${library})`);
      cy.get("h2").should("have.text", "Index Page");
    });
  }
);
