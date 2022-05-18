function shouldInspect(v) {
  return Array.isArray(v) || v.constructor.name === 'Object';
}

function cycleThrough(obj, check) {
  if (Array.isArray(obj)) {
    return obj.reduce((res, value) => [
      ...res,
      (shouldInspect(value) ? cycleThrough(value, check) : check(value))
    ], []);
  }
  return Object.entries(obj).reduce((res, [name, value]) => ({
    ...res,
    [name]: shouldInspect(value) ? cycleThrough(value, check) : check(value)
  }), {});
}

function populateWithPercentage(data) {
  const percentage = (data.displayed / data.total * 100).toFixed(2);
  data.percentage = `${percentage}%`;
}

it('Should do', () => {
  const appHost = Cypress.env('app_host');
  const apiRoutes = Cypress.env('api_routes');

  const aliases = apiRoutes.map(apiRoute => {
    const alias = `get${apiRoute.replace(/\//g, '_')}`;
    cy.intercept({ pathname: apiRoute }).as(alias);
    return `@${alias}`;
  });

  cy.visit(appHost);

  cy.wait(aliases).then(inter => {
    cy.get('body').then((b) => {
      const allElements = [];
      b.contents().map(function () {
        if (this.innerText) {
          allElements.push(this.innerText);
        }
      });
      const summary = { total: 0, displayed: 0 };
      const resultsForRequests = inter.reduce((res, { request, response }) => {
        const stats = { total: 0, displayed: 0 };
        const check = v => {
          const regex = new RegExp(`(\\s|^)${v}(\\s|$)`);
          const isPresent = allElements.some(el => regex.test(el));
          stats.total++;
          stats.displayed += +isPresent;
          return isPresent;
        };
        const fields = cycleThrough(response.body, check);
        summary.total += stats.total;
        summary.displayed += stats.displayed;
        populateWithPercentage(stats);
        return { ...res, [request.url]: { ...stats, fields } };
      }, {});

      populateWithPercentage(summary);
      const summaryResult = { resultsForRequests, summary };
      cy.writeFile('result.json', JSON.stringify(summaryResult, null, '  '));

      cy.wait(10000);
      aliases.forEach(alias => {
        cy.get(`${alias}.all`).should('have.length', 1);
      });
    })
  });
})
