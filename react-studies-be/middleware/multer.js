const multer = require('multer');
const now = require('lodash/now');


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
  const uniquePrefix = now();
  cb(null, `${uniquePrefix}-${file.originalname}`);
}

function defaultFileFilter(req, file, cb) {
  cb(null, true);
}

const FIELD_TYPES = {
  single: 'single', fields: 'fields', array: 'array',
};

function apply(fieldName, destination, {
  fieldType = FIELD_TYPES.single,
  filename = defaultFilename,
  fileFilter = defaultFileFilter
} = {}) {
  const storage = multer.diskStorage({ destination, filename });
  return multer({ storage, fileFilter })[fieldType](fieldName);
}

apply.multerUtils = multerUtils;
apply.FIELD_TYPES = FIELD_TYPES;

module.exports = apply;
