const path = require('path');

const ROOT_DIR = __dirname;
const TEST_ENGINE_DIR = path.join(ROOT_DIR, 'test-engine');

const DEFAULT_PAGE_SIZE = 30;
const NON_FIELD_ERR = 'nonFieldErr';

module.exports = {
  ROOT_DIR,
  TEST_ENGINE_DIR,

  DEFAULT_PAGE_SIZE,
  NON_FIELD_ERR
};
