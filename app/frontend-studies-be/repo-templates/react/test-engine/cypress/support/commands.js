// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('typeWithBlinkCheck', { prevSubject: true }, (subject, text) => {
  const firstLetter = text[0];
  cy.wrap(subject).type(firstLetter, { delay: 20 }).should(inp => {
    expect(inp, '__PURE__Expected the inputs to retain focus, instead they are blinking__PURE__').to.be.focused;
  }).type(text.substring(1));
});

Cypress.Commands.add('comparePathname', (shouldBeEqual, pathname, message) => {
  cy.wait(4000);
  cy.location().its('pathname').should(actualPathname => {
    if (shouldBeEqual) {
      expect(actualPathname, message).to.eq(pathname);
    } else {
      expect(actualPathname, message).to.not.eq(pathname);
    }
  });
});
