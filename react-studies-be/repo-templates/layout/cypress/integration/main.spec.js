import set from 'lodash/set';
import get from 'lodash/get';


/**
 *
 * @param {HTMLElement} node
 */
function extractPureText(node) {
  const textParts = [];
  node.childNodes.forEach(child => {
    if (child.nodeType === Node.TEXT_NODE) {
      textParts.push(child.textContent);
    }
  });
  return textParts.join('').replace(/\s+/g, ' ').trim();
}

const ANY = '__any_tag__';

function composeAllowedFor(allowedForAsArray) {
  const rule = {};
  allowedForAsArray.forEach(({ tag: providedTag, content }) => {
    const tag = providedTag || ANY;
    if (content) {
      content.forEach(textBlock => {
        set(rule, [tag, textBlock], true);
      });
    } else {
      set(rule, tag, true);
    }
  });
  return rule;
}

/**
 *
 * @param {Document} doc
 * @param {Window} win
 * @return {CSSStyleRule[]}
 */
function extractAllCssRules(doc, win) {
  const inspectedStyleSheets = {};
  const { origin } = win.location;
  const rules = [];

  /**
   *
   * @param {CSSStyleSheet} styleSheet
   */
  const extractCssRulesForStylesheet = styleSheet => {
    const { href } = styleSheet;
    if (href in inspectedStyleSheets || (new URL(href).origin !== origin)) {
      return;
    }
    inspectedStyleSheets[href] = true;

    /**
     *
     * @param {CSSRuleList} cssRules
     */
    const extractCssRulesForList = cssRules => {
      for (const cssRule of cssRules) {
        if (cssRule.constructor.name === 'CSSImportRule') {
          extractCssRulesForStylesheet(cssRule.styleSheet);
        } else if (
          cssRule.constructor.name === 'CSSMediaRule' && win.matchMedia(cssRule.conditionText).matches ||
          cssRule.constructor.name === 'CSSKeyframesRule' ||
          cssRule.constructor.name === 'CSSKeyframeRule' ||
          cssRule.constructor.name === 'CSSSupportsRule' && CSS.supports(cssRule.conditionText)
        ) {
          extractCssRulesForList(cssRule.cssRules);
        } else if (cssRule.constructor.name === 'CSSStyleRule') {
          rules.push(cssRule);
        }
      }
    };

    extractCssRulesForList(styleSheet.cssRules);
  }

  for (const sheet of doc.styleSheets) {
    extractCssRulesForStylesheet(sheet);
  }

  return rules;
}

/**
 *
 * @param {HTMLElement} element
 * @param {CSSStyleRule[]} allCssRules
 * @return {CSSStyleRule[]}
 */
function getMatchingCssRules(element, allCssRules) {
  return allCssRules.filter(cssRule => element.matches?.(cssRule.selectorText));
}

/**
 *
 * @param {CSSStyleRule | HTMLElement} source
 */
function getProperties(source) {
  if (!source?.style) {
    return {};
  }
  const { style } = source;
  return Object.values(style).reduce((result, propertyName) => ({
    ...result, [propertyName]: style.getPropertyValue(propertyName)
  }), {});
}

function getAbsPosAddition(propertiesBlock) {
  return +(propertiesBlock.position === 'absolute');
}

function getRawSizingAddition(propertiesBlock) {
  return Object.values(propertiesBlock).filter(propertyValue => /\)|\d\s*px/.test(propertyValue)).length;
}

/**
 *
 * @param {Node} node
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

beforeEach(() => {
  const { width, height } = Cypress.env('dimensions');
  cy.viewport(width, height);
});

it('task', () => {
  // Step 1: Calculate the rectangle within which the layout should be tracked
  cy.visit('http://localhost:5000/tech/blank.html');
  cy.screenshot({ capture: 'fullPage', scale: true, overwrite: true });
  cy.task('prep:rectangle').then(({ left, right, bottom }) => {
    // Step 2: Prepare a sample matching this rectangle
    cy.visit('http://localhost:5000/tech/sample.html');
    cy.matchImageSnapshot({
      capture: 'fullPage',
      scale: true,
      overwrite: true,
      clip: { x: left, y: 0, width: right - left, height: bottom }
    });

    // Step 3: Test itself
    const mustUse = Cypress.env('mustUse') || [];
    const absPosAllowedForArray = Cypress.env('absPosAllowedFor') || [];
    const rawSizingAllowedForArray = Cypress.env('rawSizingAllowedFor') || [];

    let totalPropertiesAmount = 0;

    let absPosPropertiesAmount = 0;
    const absPosAllowedFor = composeAllowedFor(absPosAllowedForArray);

    let rawSizingPropertiesAmount = 0;
    const rawSizingAllowedFor = composeAllowedFor(rawSizingAllowedForArray);

    const usedTags = {};
    const tagsUsedForTextBlocks = {};
    mustUse.forEach(({ tag, content }) => {
      if (!content) {
        usedTags[tag] = false;
      } else {
        content.forEach(textBlock => {
          if (!tagsUsedForTextBlocks[textBlock]) {
            tagsUsedForTextBlocks[textBlock] = { allowed: [], actual: [] };
          }
          tagsUsedForTextBlocks[textBlock].allowed.push(tag);
        });
      }
    });

    const indexFile = Cypress.env('indexFile')
    const indexPath = indexFile ? `/${indexFile}.html` : '';
    cy.visit(`http://localhost:5000${indexPath}`);
    cy.matchImageSnapshot({
      capture: 'fullPage',
      scale: true,
      overwrite: true,
      clip: { x: left, y: 0, width: right - left, height: bottom }
    });

    cy.window().then(win => {
      cy.document().then(doc => {
        const allCssRules = extractAllCssRules(doc, win);
        totalPropertiesAmount += allCssRules
          .map(getProperties)
          .reduce((result, properties) => result + Object.keys(properties).length, 0);
        cy.get('body').then((body) => {
          body.contents().map(function () {
            const nodes = [this, ...extractChildren(this)];
            for (const node of nodes) {
              const tagName = node.tagName?.toLowerCase();
              const pureText = extractPureText(node);

              if (tagName in usedTags) {
                usedTags[tagName] = true;
              } else {
                if (pureText in tagsUsedForTextBlocks) {
                  tagsUsedForTextBlocks[pureText].actual.push(tagName);
                }
              }

              const allCssPropertiesForNode = getMatchingCssRules(node, allCssRules).map(getProperties);
              const allStylePropertiesForNode = getProperties(node);
              totalPropertiesAmount += Object.keys(allStylePropertiesForNode).length;

              if (
                !get(absPosAllowedFor, [tagName, pureText]) &&
                !get(absPosAllowedFor, [ANY, pureText]) &&
                !get(absPosAllowedFor, tagName)
              ) {
                absPosPropertiesAmount += allCssPropertiesForNode.reduce((result, propertiesBlock) =>
                  result + getAbsPosAddition(propertiesBlock), 0
                );
                absPosPropertiesAmount += getAbsPosAddition(allStylePropertiesForNode);
              }

              if (
                !get(rawSizingAllowedFor, [tagName, pureText]) &&
                !get(rawSizingAllowedFor, [ANY, pureText]) &&
                !get(rawSizingAllowedFor, tagName)
              ) {
                rawSizingPropertiesAmount += allCssPropertiesForNode.reduce((result, propertiesBlock) =>
                  result + getRawSizingAddition(propertiesBlock), 0
                );
                rawSizingPropertiesAmount += getRawSizingAddition(allStylePropertiesForNode);
              }
            }
          });

          // Reports
          const includedMustUseTags =
            Object.values(usedTags).filter(Boolean).length / Object.keys(usedTags).length * 100;
          const properlyTaggedTextBlocks =
            Object
              .values(tagsUsedForTextBlocks)
              .filter(({ actual, allowed }) => actual.every(tag => allowed.includes(tag)))
              .length /
            Object.keys(tagsUsedForTextBlocks).length * 100;
          const absPosUsage = absPosPropertiesAmount / totalPropertiesAmount;
          const rawSizingUsage = rawSizingPropertiesAmount / totalPropertiesAmount;

          const report = {
            detail: {
              usedTags,
              tagsUsedForTextBlocks,
              totalPropertiesAmount,
              rawSizingPropertiesAmount,
              absPosPropertiesAmount,
            },
            summary: {
              includedMustUseTags,
              properlyTaggedTextBlocks,
              absPosUsage,
              rawSizingUsage
            }
          };
          cy.writeFile('report.json', JSON.stringify(report, null, '  '));
        });
      });
    });
  });
});
