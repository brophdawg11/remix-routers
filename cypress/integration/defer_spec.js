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
      cy.get("#lazy-value-fallback").should("have.text", "Loading data...");
      cy.get("#lazy-error-fallback").should("have.text", "Loading error...");
      cy.get("#lazy-value").should("not.exist");
      cy.get("#lazy-error").should("not.exist");

      // Value resolves first, error stays in fallback
      cy.get("#lazy-value").should("have.text", "Value: Lazy Data ✅");
      cy.get("#lazy-value-fallback").should("not.exist");
      cy.get("#lazy-error-fallback").should("have.text", "Loading error...");

      // Error rejects second, both fallbacks gone
      cy.get("#lazy-error").should("have.text", "Error: Lazy Error 💥");
      cy.get("#lazy-value-fallback").should("not.exist");
      cy.get("#lazy-error-fallback").should("not.exist");
    });
  }
);
