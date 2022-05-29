const snakeCase = require('lodash/snakeCase');
const path = require('path');
const { API_PATH } = require('../settings');
const { listUsableFiles, baseNoExt } = require('../util/misc');


function apply(app) {
  listUsableFiles(__dirname, __filename).forEach(file => {
    const router = require(path.join(__dirname, file));
    app.use(`${API_PATH}/${snakeCase(baseNoExt(file))}`, router);
  });
}

module.exports = apply;
