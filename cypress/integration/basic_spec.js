/// <reference types="cypress" />

function testJson(selector, cb) {
  cy.get(selector).should(($el) => cb(JSON.parse($el.text())));
}

describe("Remix Router Navigation", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });

  it("displays the index page and router info", () => {
    cy.get("h1").should("have.text", "Root Layout");
    cy.get("h2").should("have.text", "Index Page");

    testJson("#location", (location) =>
      expect(location.pathname).to.equal("/")
    );

    testJson("#navigation", (navigation) =>
      expect(navigation.state).to.equal("idle")
    );

    testJson("#matches", (matches) =>
      expect(matches).to.deep.equal([
        { id: "0", pathname: "/", params: {} },
        { id: "0-0", pathname: "/", params: {} },
      ])
    );
  });

  it("navigates to /page1", () => {
    cy.get("a[href='/page1']").click();

    // Location stays on source page during navigation
    cy.get("h2").should("have.text", "Index Page");

    testJson("#navigation", (navigation) => {
      expect(navigation.state).to.equal("loading");
      expect(navigation.location?.pathname).to.equal("/page1");
    });

    testJson("#location", (location) =>
      expect(location.pathname).to.equal("/")
    );

    // Location updates once navigation completes
    cy.get("h2").should("have.text", "Page 1");

    testJson("#navigation", (navigation) => {
      expect(navigation.state).to.equal("idle");
    });

    testJson("#location", (location) =>
      expect(location.pathname).to.equal("/page1")
    );

    testJson("#matches", (matches) =>
      expect(matches).to.deep.equal([
        { id: "0", pathname: "/", params: {} },
        { id: "0-1", pathname: "/page1", params: {}, data: {} },
      ])
    );
  });
});
