/// <reference types="cypress" />

describe("Tasks", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/tasks");
  });

  it("displays seeded tasks", () => {
    cy.get("li").should("have.length", 20);
  });

  it("should open tasks", () => {
    cy.get('li:nth-child(5) a[href="/tasks/5"]').click();
    cy.location("pathname").should("equal", "/tasks/5");
    cy.get("h3").should("have.text", "Task");
    cy.get("h3 ~ p").should("have.text", "Task #5");
  });

  it("should add new tasks", () => {
    cy.get("a[href='/tasks/new']").click();
    cy.get('input[name="newTask"]').type("Test Task 1");
    cy.location("pathname").should("equal", "/tasks/new");
    cy.get("h3")
      .should("have.text", "New Task")
      .siblings("form")
      .children('button[type="submit"]')
      .click()
      .should("have.text", "Adding...")
      .should("be.disabled");
    cy.get("li").should("have.length", 21);
    cy.get("li").last().should("contain.text", "Test Task 1");
    cy.location("pathname").should("equal", "/tasks");
    cy.get("li")
      .last()
      .find('button[type="submit"]')
      .click()
      .should("have.text", "Deleting...")
      .should("be.disabled");
    cy.get("li").should("have.length", 20);
  });

  it("should delete tasks using fetchers", () => {
    let tasks = [1, 3, 5];

    for (let i = 0; i < tasks.length; i++) {
      let n = tasks[i];
      cy.get(`li:nth-child(${n})`).find('button[type="submit"]').click();
    }

    // all deleting in parallel
    for (let i = 0; i < tasks.length; i++) {
      let n = tasks[i];
      cy.get(`li:nth-child(${n})`)
        .find('button[type="submit"]')
        .should("have.text", "Deleting...")
        .should("be.disabled");
    }

    // All deleted successfully
    cy.get("li").should("have.length", 17);
  });
});
