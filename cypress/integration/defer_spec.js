/// <reference types="cypress" />
const { conditionalDescribe } = require("../utils/utils");

conditionalDescribe(
  { react: true, vue: true, svelte: false },
  "Deferred Data",
  () => {
    beforeEach(() => {
      cy.visit("http://localhost:3000/");
    });

    it("renders deferred data as it resolves/rejects", () => {
      cy.get("a[href='/defer']").click();

      // Critical data shows immediately
      cy.get("#critical-data").should(
        "have.text",
        "Critical Data: Critical Data"
      );

      // Both fallbacks show
      cy.get("#lazy-value").should("have.text", "Loading data...");
      cy.get("#lazy-error").should("have.text", "Loading error...");

      // Value resolves first, error stays in fallback
      cy.get("#lazy-value").should("have.text", "Value: Lazy Data ✅");
      cy.get("#lazy-error").should("have.text", "Loading error...");

      // Error rejects second, both fallbacks gone
      cy.get("#lazy-value").should("have.text", "Value: Lazy Data ✅");
      cy.get("#lazy-error").should("have.text", "Error: Lazy Error 💥");
    });

    it("freezes deferred data on cancellation", () => {
      cy.get("a[href='/defer']").click();

      // Critical data shows immediately
      cy.get("#critical-data").should(
        "have.text",
        "Critical Data: Critical Data"
      );

      // Both fallbacks show
      cy.get("#lazy-value").should("have.text", "Loading data...");
      cy.get("#lazy-error").should("have.text", "Loading error...");

      // Value resolves first, error stays in fallback
      cy.get("#lazy-value").should("have.text", "Value: Lazy Data ✅");
      cy.get("#lazy-error").should("have.text", "Loading error...");

      // Click same link to revalidate all loaders
      cy.get("a[href='/defer']").click();

      // Remains frozen in the same half-resolved state
      cy.get("#lazy-value").should("have.text", "Value: Lazy Data ✅");
      cy.get("#lazy-error").should("have.text", "Loading error...");

      // Upon final resolution, both fallbacks gone
      cy.get("#lazy-value").should("have.text", "Value: Lazy Data ✅");
      cy.get("#lazy-error").should("have.text", "Error: Lazy Error 💥");
    });
  }
);
