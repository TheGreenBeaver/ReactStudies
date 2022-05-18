const multer = require('multer');
const applyToRouter = require('./apply-to-router');
const { generateRandomString } = require('../util/encrypt');
const { now } = require('lodash');


const multerUtils = {
  // All files in one request saved with same timestamp
  useSingleTs: req => {
    if (req.__multerTs__ == null) {
      req.__multerTs__ = now();
    }
    return req.__multerTs__;
  },
  // Index for array fields
  useIndexation: (req, base = 1) => {
    if (req.__multerIdx__ == null) {
      req.__multerIdx__ = base;
    }
    return req.__multerIdx__++;
  }
}

function defaultFilename(req, file, cb) {
  const uniquePrefix = generateRandomString(5);
  cb(null, `${uniquePrefix}-${file.originalname}`);
}

function defaultFileFilter(req, file, cb) {
  cb(null, true);
}

function apply(router, fieldName, destination, {
  fieldType = 'single', routes,
  filename = defaultFilename,
  fileFilter = defaultFileFilter
} = {}) {
  const storage = multer.diskStorage({ destination, filename });
  const fileParser = multer({ storage, fileFilter })[fieldType](fieldName);

  applyToRouter(fileParser, router, routes);
}

apply.multerUtils = multerUtils;

module.exports = apply;