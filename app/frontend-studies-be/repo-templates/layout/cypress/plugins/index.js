/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const {
  addMatchImageSnapshotPlugin,
} = require('cypress-image-snapshot/plugin');
const fs = require('fs');
const { PNG } = require('pngjs');
const path = require('path');

/**
 * @type {Cypress.PluginConfig}
 */

// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  addMatchImageSnapshotPlugin(on, config);

  on('task', {
    'prep:rectangle': () => new Promise(resolve => {
      const lastSepIdx = __dirname.lastIndexOf(path.sep);
      const rootDir = __dirname.substring(0, lastSepIdx);
      const pathToScreenshot = path.join(rootDir, 'screenshots', 'main.spec.js', 'task.png');
      fs.createReadStream(pathToScreenshot).pipe(new PNG({ filterType: 4 })).on('parsed', function () {
        const { width, height, data } = this;
        const result = { left: 0, right: 0, bottom: 0 };

        let x = 0;
        for (; x < width * 4; x += 4) {
          if (data[x] + data[x + 1] + data[x + 2] !== 0) {
            result.left = x;
            break;
          }
        }

        for (; x < width * 4; x += 4) {
          if (data[x] + data[x + 1] + data[x + 2] === 0) {
            result.right = x;
            break;
          }
        }

        for (let y = 0; y < height; y++) {
          const place = y * width * 4 + result.left;
          if (data[place] + data[place + 1] + data[place + 2] === 0) {
            result.bottom = y;
            break;
          }
        }

        result.left /= 4;
        result.right /= 4;
        resolve(result);
      });
    }),
  });
}
