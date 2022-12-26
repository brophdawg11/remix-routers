/// <reference types="cypress" />

const { conditionalDescribe } = require("../utils/utils");

function testJson(selector, cb) {
  cy.get(selector).should(($el) => cb(JSON.parse($el.text())));
}

conditionalDescribe(
  { react: true, vue: true, svelte: true },
  "Redirects",
  () => {
    beforeEach(() => {
      cy.visit("http://localhost:3000/");
    });

    it("redirects to /parent/child", () => {
      cy.get("a[href='/redirect?location=%2Fparent%2Fchild']").click();

      testJson("#navigation", (navigation) => {
        expect(navigation.state).to.equal("loading");
        expect(navigation.location?.pathname).to.equal("/redirect");
        expect(navigation.location?.search).to.equal(
          "?location=%2Fparent%2Fchild"
        );
      });

      testJson("#location", (location) =>
        expect(location.pathname).to.equal("/")
      );

      // Navigation complete
      cy.get("h2").should("have.text", "Parent Layout");
      cy.get("h3").should("have.text", "Child Route");
      cy.get("p#parent").should("have.text", "Parent data: parent loader data");
      cy.get("p#child").should("have.text", "Child data: child loader data");

      testJson("#navigation", (navigation) => {
        expect(navigation.state).to.equal("idle");
      });
    });
  }
);
