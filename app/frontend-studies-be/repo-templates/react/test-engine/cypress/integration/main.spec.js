import { generate as generatePassword } from 'generate-password';
import moment from 'moment';
import mapValues from 'lodash/mapValues';
import set from 'lodash/set';
import get from 'lodash/get';


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

function setupAliases(...endpoints) {
  return endpoints.map(endpoint => {
    const [method, ...pathnameParts] = endpoint.split(' ');
    const pathname = pathnameParts.join('');
    const alias = `${method}_${pathname.replace(/\//g, '_')}`;
    cy.intercept({ url: `**${pathname}*`, method }).as(alias);
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

function getMinMax(providedMin, providedMax, defaultMin, defaultMax) {
  let min, max;

  if (providedMin) {
    min = providedMin;
  } else {
    min = providedMax == null ? defaultMin : Math.min(defaultMin, providedMax);
  }

  if (providedMax) {
    max = providedMax;
  } else {
    max = providedMin == null ? defaultMax : Math.max(defaultMax, providedMin);
  }

  return [min, max];
}

function generateRandomNum(min, max, int = true) {
  const raw = Math.random() * (max - min + 1) + min;
  return int ? Math.floor(raw) : raw;
}

function generateRandomOption(options) {
  const idx = generateRandomNum(0, options.length - 1);
  return options[idx];
}

const allLetterSets = {
  latin: 'qwertyuiopasdfghjklzxcvbnm',
  numbers: '1234567890',
  symbols: '!@#$%^&*()_+-=<>?/,.{}[]\\|"\';:`~!№',
  spaces: '\n\t ',
  nonLatin: 'йцукенгшщзхъфывапролджэячсмитьбю',
};
function generateRandomString(length = 10, letterSets = ['latin'], allowCapital = false) {
  const lowercase = letterSets.map(setName => allLetterSets[setName]).join('');
  const letters = allowCapital ? `${lowercase}${lowercase.toUpperCase()}` : lowercase;
  return [...Array(length)].map(() => {
    const letterIdx = generateRandomNum(0, letters.length - 1)
    return letters[letterIdx];
  }).join('');
}

const blocker = Symbol();

const usedStrings = {};
const usedEmails = {};
const usedEnumValues = {};
function generateShape(shape, parentIdxForShape = null, path = []) {
  function generateField(fieldConfig, fieldName, parentIdxForField = null) {
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
      of: arrayOf,
      unique,
      letterSets: _letterSets,
      allowCapital: _allowCapital
    } = fieldConfig;

    let val;
    if (typeof type === 'object') {
      val = generateShape(type, parentIdxForField, [...path, ...fieldName]);
    } else {
      switch (type) {
        case 'string': {
          const generate = () => {
            let min, max, letterSets, allowCapital;
            if (email) {
              min = 5;
              max = 90;
              letterSets = ['latin'];
              allowCapital = false;
            } else {
              [min, max] = getMinMax(_min, _max, 3, 30);
              letterSets = _letterSets || ['latin'];
              allowCapital = _allowCapital;
            }
            const length = generateRandomNum(min, max);
            const raw = generateRandomString(length, letterSets, allowCapital);
            return email ? `${raw.toLowerCase()}@gmail.com` : raw;
          };

          if (!email && !unique) {
            val = generate();
          } else {
            do {
              val = generate();
            } while (get(email ? usedEmails : usedStrings, [...path, ...fieldName, val]));
            set(email ? usedEmails : usedStrings, [...path, ...fieldName, val], true);
          }
          break;
        }
        case 'number': {
          const [min, max] = getMinMax(_min, _max, -1000, 1000);
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
          const [min, max] = getMinMax(_min, _max, 1, 60);
          const length = generateRandomNum(min, max);
          val = [];
          for (const idx in [...Array(length)]) {
            const newEntry = generateField(arrayOf, [parentIdxForShape, ...fieldName], +idx);
            if (Array.isArray(newEntry) && newEntry[1] === blocker) {
              val.push(newEntry[0]);
              break;
            } else {
              val.push(newEntry);
            }
          }
          break;
        }
        case 'enum': {
          if (!unique) {
            val = generateRandomOption(values);
          } else {
            do {
              val = generateRandomOption(values);
            } while (get(usedEnumValues, [...path, ...fieldName, val]));
            set(usedEnumValues, [...path, ...fieldName, val], true);
            if (parentIdxForField === values.length - 1) {
              val = [val, blocker];
            }
          }
          break;
        }
      }
    }

    return nullable ? generateRandomOption([val, null]) : val;
  }

  return Object.entries(shape).reduce((result, [fieldName, fieldConfig]) => ({
    ...result, [fieldName]: generateField(fieldConfig, [fieldName], parentIdxForShape)
  }), {});
}

function uploadDump({ dump, dumpIsTemplate, dumpUploadUrl, dumpUploadMethod }) {
  const data = dumpIsTemplate
    ? [...Array(generateRandomNum(100, 800))].map((_, idx) => generateShape(JSON.parse(dump), idx))
    : dump;
  cy.request(dumpUploadMethod, dumpUploadUrl, data).its('body').as('dumpKeys');
  return data;
}

const spaces = [' ', '\n', '\t'];
function stringIsIncluded(parentText, str) {
  for (let i = 0; i < spaces.length; i++) {
    for (let j = 0; j < spaces.length; j++) {
      if (parentText.includes(`${spaces[i]}${str}${spaces[j]}`)) {
        return true;
      }
    }
  }
  return spaces.some(space => parentText.startsWith(`${str}${space}`) || parentText.endsWith(`${space}${str}`));
}

function collectDataCoverage(interceptions, dumpChunk, fileName, body) {
  cy.wait(3000);
  /**
   *
   * @type {Array<Node>}
   */
  const allElements = [];
  body.contents().map(function () {
    allElements.push(this, ...extractChildren(this));
  });

  const initialMarks = mapValues(MARKS, () => 0);
  const report = {
    endpoints: { summary: { totalFields: 0, ...initialMarks } },
  };

  const getMark = inspectedData => value => {
    report[inspectedData].summary.totalFields++;

    const momentValue = moment(value);
    for (const { textContent } of allElements) {
      if (textContent === value) {
        report[inspectedData].summary[MARKS.foundExactly]++;
        return MARKS.foundExactly;
      }
      const momentTextContent = moment(textContent);
      if (
        stringIsIncluded(textContent, value) ||
        (
          momentValue.isValid() &&
          momentTextContent.isValid() &&
          ['second', 'minute', 'hour', 'day'].some(granularity =>
            momentTextContent.isSame(momentValue, granularity),
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

  if (dumpChunk) {
    report.dump = { summary: { totalFields: 0, ...initialMarks } };
    report.dump.detail = markData(dumpChunk, getMark('dump'));
  }

  cy.writeFile(`reports/${fileName}.json`, JSON.stringify(report, null, '  '));
}

const PURE = '__PURE__';
const MESSAGES = mapValues({
  authOnlyAllowed: 'Expected auth-only route to be accessible for an authorized user',
  authOnlyForbidden: 'Expected auth-only route not to be accessible for a non-authorized user',
  clientError: endpoint => `Expected a client error status code when requesting ${endpoint} with invalid data`,
  success: endpoint => `Expected a success status code when requesting ${endpoint} with valid data`,
  credentialsSaved: 'Expected credentials to be saved in browser (sessionStorage, localStorage or cookies)',
  endpointCalls: exception => `Expected each of the endpoints to be called once${exception
    ? `(${exception.count} at most for ${exception.name})` : ''}`,
  tooOften: name => `Expected ${name} endpoint not to be called too often`
}, msg => typeof msg  === 'function'? (...args) => `${PURE}${msg(...args)}${PURE}` : `${PURE}${msg}${PURE}`);

it('task', () => {
  // Sign Up + Log In behaviour
  const auth = Cypress.env('auth');
  if (auth) {
    const {
      hasVerification,

      routes: [signUpRoute, logInRoute],
      endpoints: [signUpEndpoint, logInEndpoint, verificationEndpoint],
      special: authOnlyRoute
    } = auth;

    // API
    const [signUpAlias, logInAlias] = setupAliases(signUpEndpoint, logInEndpoint);

    // Visit SignUp
    cy.visit(signUpRoute);

    // Prepare for persistent authentication check

    cy.window().its('localStorage').its('length').as('initialLocalStorage');
    cy.window().its('sessionStorage').its('length').as('initialSessionStorage');
    cy.getCookies().as('initialCookies');

    // Ensure it does not allow visiting auth-only pages
    cy.visit(authOnlyRoute);
    cy.comparePathname(false, authOnlyRoute, MESSAGES.authOnlyForbidden);

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
      cy.origin('http://localhost:5051/last_email', () => {
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
    cy.comparePathname(false, authOnlyRoute, MESSAGES.authOnlyForbidden);

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
      .should(statusCode => {
        expect(statusCode, MESSAGES.clientError('Log In')).to.be.gte(400).and.lt(500);
      });

    // Fix inputs and submit again
    cy.get('input[data-field]').each(inp => {
      cy.wrap(inp).type('{backspace}{backspace}{backspace}');
    });
    cy.get('[type=submit]').click();

    // Expect a 2xx success
    cy.wait(logInAlias)
      .its('response')
      .its('statusCode')
      .should(statusCode => {
        expect(statusCode, MESSAGES.success('Log In')).to.be.gte(200).and.lt(300);
      });

    // Check access
    cy.visit(authOnlyRoute);
    cy.comparePathname(true, authOnlyRoute, MESSAGES.authOnlyAllowed);

    // Check persistent authentication
    cy.window().then(win => cy.getCookies().then(newCookies => {
      cy.get('@initialCookies').then(initialCookies => {
        const cookiesChanged = newCookies.length !== initialCookies.length;
        const newLocalStorageSize = win.localStorage.length;
        const newSessionStorageSize = win.sessionStorage.length;

        cy.get('@initialLocalStorage').then(initialLocalStorage =>
          cy.get('@initialSessionStorage').then(initialSessionStorage => {
            const localStorageChanged = newLocalStorageSize !== initialLocalStorage;
            const sessionStorageChanged = newSessionStorageSize !== initialSessionStorage;
            cy.wrap(cookiesChanged || localStorageChanged || sessionStorageChanged).should(credentialsSaved => {
              expect(credentialsSaved, MESSAGES.credentialsSaved).to.be.true;
            });
          })
        );
      });
    }))

    // Ensure that persistent authentication is actually used
    cy.reload();
    cy.comparePathname(true, authOnlyRoute, MESSAGES.authOnlyAllowed);
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
      special: searchEndpoint
    } = entityList;
    const [entityListRoute] = routes;

    // API
    const entityListAliases = setupAliases(...endpoints);

    // Visit EntityList
    cy.visit(entityListRoute);

    cy.wait(entityListAliases).then(interceptions => {
      cy.get('body').then(body => {
        collectDataCoverage(interceptions, uploadedDump, 'entityList', body);

        if (hasSearch) {
          const [searchEndpointAlias] = setupAliases(searchEndpoint);
          cy.get('input[data-search-input]').then(searchInput => {
            cy.wrap(searchInput).type(generateRandomString(8), { delay: 20 });
            cy.get(`${searchEndpointAlias}.all`).should(calls => {
              expect(calls, MESSAGES.tooOften('Search')).to.have.length.below(2);
            });
            const submitSearch = body.find('[data-submit-search]');
            if (submitSearch) {
              cy.wrap(submitSearch).click();
            }
            cy.wait(searchEndpointAlias);
            cy.wait(5000);
            cy.get(`${searchEndpointAlias}.all`).should(calls => {
              expect(calls, MESSAGES.tooOften('Search')).to.have.length.below(3);
            });
          });
        } else {
          cy.wait(5000);
        }

        const exception = hasSearch ? { name: 'Search', count: 2 } : null;
        entityListAliases.forEach(alias => {
          cy.get(`${alias}.all`).should(calls => {
            expect(calls, MESSAGES.endpointCalls(exception)).to.have.length.below(3);
          });
        });
      });
    });
  }

  const singleEntity = Cypress.env('singleEntity');
  if (singleEntity) {
    const {
      routes,
      endpoints,
    } = singleEntity;
    const [rawSingleEntityRoute] = routes;
    const singleEntityAliases = setupAliases(...endpoints);

    if (dumpConfig) {
      cy.get('@dumpKeys').then(dumpKeys => {
        const idx = generateRandomNum(0, dumpKeys.length);
        const key = dumpKeys[idx];
        const singleEntityRoute = rawSingleEntityRoute.replace('{key}', key.toString());

        cy.visit(singleEntityRoute);

        cy.wait(singleEntityAliases).then(interceptions => {
          cy.get('body').then(body => {
            collectDataCoverage(interceptions, uploadedDump[idx], 'singleEntity', body);
          });
        });
      });
    } else {
      cy.visit(rawSingleEntityRoute);

      cy.wait(singleEntityAliases).then(interceptions => {
        cy.get('body').then(body => {
          collectDataCoverage(interceptions, null, 'singleEntity', body);
        });
      });
    }
  }
});
