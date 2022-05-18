it('Should match the sample image', () => {
  const appHost = Cypress.env('app_host');
  cy.visit(appHost);
  cy.screenshot();
  cy.matchImageSnapshot();
});
