const fs = require('fs');
const { snakeCase } = require('lodash');
const path = require('path');
const { API_PATH } = require('../settings');
const { getFileIsUsable } = require('../util/misc');


const basename = path.basename(__filename);

function apply(app) {
  fs
    .readdirSync(__dirname)
    .filter(file => getFileIsUsable(file, basename))
    .forEach(file => {
      const router = require(path.join(__dirname, file));
      app.use(`${API_PATH}/${snakeCase(path.basename(file, '.js'))}`, router);
    });
}

module.exports = apply;