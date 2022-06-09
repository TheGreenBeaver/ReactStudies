import { generate as generatePassword } from 'generate-password';
import moment from 'moment';
import mapValues from 'lodash/mapValues';


const MARKS = {
  notFound: 'notFound',
  roughMatch: 'roughMatch',
  foundExactly: 'foundExactly',
};

function shouldInspect(v) {
  return Array.isArray(v) || v.constructor.name === 'Object';
}

function markData(data, getMark) {
  if (Array.isArray(data)) {
    return data.reduce((res, value) => [
      ...res,
      (shouldInspect(value) ? markData(value, getMark) : getMark(value))
    ], []);
  }
  return Object.entries(data).reduce((res, [name, value]) => ({
    ...res,
    [name]: shouldInspect(value) ? markData(value, getMark) : getMark(value)
  }), {});
}

/**
 *
 * @param {Node} node
 * @return {Array<Node>}
 */
function extractChildren(node) {
  if (!node.childNodes?.length) {
    return [node];
  }
  const children = [...node.childNodes];
  for (const child of node.childNodes) {
    children.push(...extractChildren(child));
  }
  return children.flat();
}

function generateRandomNum(min, max, int = true) {
  const raw = Math.random() * (max - min + 1) + min;
  return int ? Math.floor(raw) : raw;
}

function generateRandomOption(options) {
  const idx = generateRandomNum(0, options.length - 1);
  return options[idx];
}

const letters = 'qQwWeErRtTyYuUiIoOpPaAsSdDfFgGhHjJkKlLzZxXcCvVbBnNmM';
function generateRandomString(length = 10) {
  return [...Array(length)].map(() => {
    const letterIdx = generateRandomNum(0, letters.length - 1)
    return letters[letterIdx];
  }).join('');
}

function setupAliases(...endpoints) {
  return endpoints.map(endpoint => {
    const alias = `get${endpoint.replace(/\//g, '_')}`;
    cy.intercept({ url: `**${endpoint}*` }).as(alias);
    return `@${alias}`;
  });
}

function clearStorages() {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.window().then(win => {
    win.sessionStorage.clear();
  });
}

const usedEmails = {};
function generateShape(shape) {
  function generateField(fieldConfig) {
    const {
      type,
      max: _max,
      min: _min,
      nullable,
      email,
      int = false,
      allowPast = true,
      allowFuture = true,
      format = 'YYYY-MM-DD:hh-mm-ss',
      values,
      of: arrayOf
    } = fieldConfig;

    let val;
    if (typeof type === 'object') {
      val = generateShape(type);
    } else {
      switch (type) {
        case 'string': {
          const generate = () => {
            const min = email ? 5 : (_min || 5);
            const max = email ? 190 : (_max || 30);
            const length = generateRandomNum(min, max);
            const raw = generateRandomString(length);
            return email ? `${raw.toLowerCase()}@gmail.com` : raw;
          };

          if (!email) {
            val = generate();
          } else {
            do {
              val = generate();
            } while (usedEmails[val]);
            usedEmails[val] = true;
          }
          break;
        }
        case 'number': {
          const min = _min || -1000;
          const max = _max || 1000;
          val = generateRandomNum(min, max, int);
          break;
        }
        case 'date': {
          const raw = new Date();
          if (!allowFuture && !allowPast) {
            val = moment(raw).format(format);
            break;
          }
          const shift = generateRandomNum(0, 24 * 30 * 12 * 2);
          const shiftDirs = [];
          if (allowFuture) {
            shiftDirs.push('add');
          }
          if (allowPast) {
            shiftDirs.push('subtract');
          }
          const shiftDir = generateRandomOption(shiftDirs);
          val = moment(raw)[shiftDir](shift, 'hours').format(format);
          break;
        }
        case 'bool': {
          val = generateRandomOption([true, false]);
          break;
        }
        case 'array': {
          const length = generateRandomNum(_min || 1, _max || 60);
          val = [...Array(length)].map(() => generateField(arrayOf))
          break;
        }
        case 'enum': {
          val = generateRandomOption(values);
          break;
        }
      }
    }

    return nullable ? generateRandomOption([val, null]) : val;
  }

  return Object.values(shape).reduce((result, [fieldName, fieldConfig]) => ({
    ...result, [fieldName]: generateField(fieldConfig)
  }), {});
}

function uploadDump({ dump, dumpIsTemplate, upload: { url, method } }) {
  const data = dumpIsTemplate
    ? [...Array(generateRandomNum(100, 800))].map(() => generateShape(dump))
    : dump;
  cy.request(method, url, data);
  return data;
}

it('task', () => {
  // Sign Up + Log In behaviour
  const auth = Cypress.env('auth');
  if (auth) {
    const {
      hasVerification,

      routes: [_signUpRoute, _logInRoute],
      endpoints: [signUpEndpoint, logInEndpoint, verificationEndpoint],
      special: _authOnlyRoute
    } = auth;
    const signUpRoute = _signUpRoute || '/';
    const logInRoute = _logInRoute.route || '/';
    const authOnlyRoute = _authOnlyRoute || '/';

    // API
    const [signUpAlias, logInAlias] = setupAliases(signUpEndpoint, logInEndpoint);

    // Visit SignUp
    cy.visit(signUpRoute);

    // Prepare for persistent authentication check
    const initialLocalStorageSize = localStorage.length;
    const initialSessionStorageSize = sessionStorage.size;
    cy.getCookies().as('initialCookies');

    // Ensure it does not allow visiting auth-only pages
    cy.visit(authOnlyRoute);
    cy.comparePathname('not.eq', authOnlyRoute);

    // Return to SignUp in case it's not the default route
    cy.visit(signUpRoute);

    // Fill in auth data, remember values, click submit
    const authData = {};
    cy.get('input[data-field]').each(inp => {
      const name = inp.attr('data-field');
      let valueToType;
      if (name.startsWith('repeat-')) {
        valueToType = authData[name.replace('repeat-', '')]
      } else {
        switch (name) {
          case 'email':
            valueToType = 'email@gmail.com';
            break;
          case 'password':
            valueToType = generatePassword({
              length: 10,
              numbers: true,
              symbols: true,
              lowercase: true,
              uppercase: true,
              strict: true
            });
            break;
          default:
            valueToType = generateRandomString();
        }
        authData[name] = valueToType;
      }
      cy.wrap(inp).typeWithBlinkCheck(valueToType);
    });
    cy.get('[type=submit]').click();
    cy.wait(signUpAlias);

    // Email verification
    if (hasVerification) {
      const [verificationAlias] = setupAliases(verificationEndpoint);
      cy.origin('http://localhost:5050/last_email', () => {
        cy.get('a').as('verificationLink');
      });
      cy.get('@verificationLink').then(verificationLink => {
        cy.visit(new URL(verificationLink.attr('href')).pathname);
      });
      cy.wait(verificationAlias);
    }

    // In case authentication is performed right after the signup
    clearStorages();

    // Ensure it STILL does not allow visiting auth-only pages
    cy.visit(authOnlyRoute);
    cy.comparePathname('not.eq', authOnlyRoute);

    // Visit LogIn
    cy.visit(logInRoute);

    // Input bad values
    cy.get('input[data-field]').each(inp => {
      const name = inp.attr('data-field');
      cy.wrap(inp).typeWithBlinkCheck(`${authData[name]}bad`);
    });
    cy.get('[type=submit]').click();

    // Expect a 4xx client error
    cy.wait(logInAlias)
      .its('response')
      .its('statusCode')
      .should('be.gte', 400)
      .should('be.lt', 500);

    // Fix inputs and submit again
    cy.get('input[data-field]').each(inp => {
      cy.wrap(inp).type('{backspace}{backspace}{backspace}');
    });
    cy.get('[type=submit]').click();

    // Expect a 2xx success
    cy.wait(logInAlias)
      .its('response')
      .its('statusCode')
      .should('be.gte', 200)
      .should('be.lt', 300);

    // Check access
    cy.visit(authOnlyRoute);
    cy.comparePathname('eq', authOnlyRoute);

    // Check persistent authentication
    const newLocalStorageSize = localStorage.length;
    const newSessionStorageSize = sessionStorage.length;
    cy.getCookies().then(newCookies => {
      cy.get('@initialCookies').then(initialCookies => {
        const cookiesChanged = newCookies.length !== initialCookies.length;
        const localStorageChanged = newLocalStorageSize !== initialLocalStorageSize;
        const sessionStorageChanged = newSessionStorageSize !== initialSessionStorageSize;
        cy.wrap(cookiesChanged || localStorageChanged || sessionStorageChanged).should('be.true');
      });
    });

    // Ensure that persistent authentication is actually used
    cy.reload();
    cy.comparePathname('eq', authOnlyRoute);
  }

  let uploadedDump;
  const dumpConfig = Cypress.env('dumpConfig');
  if (dumpConfig) {
    uploadedDump = uploadDump(dumpConfig);
  }

  // Entity list behaviour
  const entityList = Cypress.env('entityList');
  if (entityList) {
    const {
      hasSearch,

      routes,
      endpoints,
      special: listEndpoint
    } = entityList;
    const [_entityListRoute] = routes;
    const entityListRoute = _entityListRoute || '/';

    // API
    const aliases = setupAliases(listEndpoint, ...endpoints);

    // Visit EntityList
    cy.visit(entityListRoute);

    cy.wait(aliases).then(interceptions => {
      cy.get('body').then(body => {
        /**
         *
         * @type {Array<Node>}
         */
        const allElements = []
        body.contents().map(function () {
          allElements.push(this, ...extractChildren(this));
        });

        const initialMarks = mapValues(MARKS, () => 0)
        const report = {
          endpoints: { summary: { totalFields: 0, ...initialMarks } }
        };

        const getMark = inspectedData => value => {
          report[inspectedData].summary.totalFields++;

          const pattern = new RegExp(`(\\s|^)${value}(\\s|$)`);
          const momentValue = moment(value);
          for (const { textContent } of allElements) {
            if (textContent === value) {
              report[inspectedData].summary[MARKS.foundExactly]++;
              return MARKS.foundExactly;
            }
            const momentTextContent = moment(textContent);
            if (
              pattern.test(textContent) ||
              (
                momentValue.isValid() &&
                momentTextContent.isValid() &&
                ['second', 'minute', 'hour', 'day'].some(granularity =>
                  momentTextContent.isSame(momentValue, granularity)
                )
              )
            ) {
              report[inspectedData].summary[MARKS.roughMatch]++;
              return MARKS.roughMatch;
            }
          }

          report[inspectedData].summary[MARKS.notFound]++;
          return MARKS.notFound;
        };

        report.endpoints.detail = interceptions.reduce((result, { request, response }) => {
          const dataCoverage = markData(response.body, getMark('endpoints'));
          const key = new URL(request.url).pathname;
          return { ...result, [key]: dataCoverage };
        }, {});

        if (uploadedDump) {
          report.dump = { summary: { totalFields: 0, ...initialMarks } };
          report.dump.detail = markData(uploadedDump, getMark('dump'));
        }

        cy.writeFile('reports/entityList.json', JSON.stringify(report, null, '  '));

        cy.wait(10000);
        aliases.forEach(alias => {
          cy.get(`${alias}.all`).should('have.length', 1);
        });
      })
    });
  }

  const singleEntity = Cypress.env('singleEntity');






});
