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
  cy.wrap(subject).type(firstLetter, { delay: 20 }).should('be.focused').type(text.substring(1));
  return subject;
});

Cypress.Commands.add('comparePathname', (chainer, pathname) => {
  cy.url().then(url => new URL(url)).its('pathname').should(chainer, pathname);
});
