/// <reference types="cypress" />

function testJson(selector, cb) {
  cy.get(selector).should(($el) => cb(JSON.parse($el.text())));
}

describe("Basic Navigation", () => {
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

  it("navigates to /parent and /parent/child", () => {
    // Navigate to parent
    cy.get("a[href='/parent']").click();

    //// Location stays on source page during navigation
    cy.get("h2").should("have.text", "Index Page");

    testJson("#navigation", (navigation) => {
      expect(navigation.state).to.equal("loading");
      expect(navigation.location?.pathname).to.equal("/parent");
    });

    testJson("#location", (location) =>
      expect(location.pathname).to.equal("/")
    );

    //// Location updates once navigation completes
    cy.get("h2").should("have.text", "Parent Layout");
    cy.get("p").should("have.text", "Parent data: parent loader data");

    testJson("#navigation", (navigation) => {
      expect(navigation.state).to.equal("idle");
    });

    testJson("#location", (location) =>
      expect(location.pathname).to.equal("/parent")
    );

    testJson("#matches", (matches) =>
      expect(matches).to.deep.equal([
        { id: "0", pathname: "/", params: {} },
        {
          id: "0-1",
          pathname: "/parent",
          params: {},
          data: { data: "parent loader data" },
        },
      ])
    );

    // Navigate to /parent/child
    cy.get("a[href='/parent/child']").click();

    //// Location stays on source page during navigation
    cy.get("h2").should("have.text", "Parent Layout");

    testJson("#navigation", (navigation) => {
      expect(navigation.state).to.equal("loading");
      expect(navigation.location?.pathname).to.equal("/parent/child");
    });

    testJson("#location", (location) =>
      expect(location.pathname).to.equal("/parent")
    );

    //// Location updates once navigation completes
    cy.get("h2").should("have.text", "Parent Layout");
    cy.get("h3").should("have.text", "Child Route");
    cy.get("p#parent").should("have.text", "Parent data: parent loader data");
    cy.get("p#child").should("have.text", "Child data: child loader data");

    testJson("#navigation", (navigation) => {
      expect(navigation.state).to.equal("idle");
    });

    testJson("#location", (location) =>
      expect(location.pathname).to.equal("/parent/child")
    );

    testJson("#matches", (matches) =>
      expect(matches).to.deep.equal([
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
      ])
    );
  });
});
