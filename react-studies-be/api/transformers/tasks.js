const mapValues = require('lodash/mapValues');
const { paginationTransformer } = require('../../util/transformers');


module.exports = {
  create: req => {
    req.body = mapValues(req.body, (fieldValue, fieldName) => {
      if (['absPos', 'rawSizing'].includes(fieldName)) {
        return JSON.parse(fieldValue);
      }
      if (['mustUse'].includes(fieldName)) {
        const adjusted = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
        return adjusted.map(el => JSON.parse(el));
      }
      if (['rememberToken', 'trackUpdates'].includes(fieldName)) {
        switch (fieldValue) {
          case 'true':
            return true;
          case 'false':
            return false;
          default:
            return fieldValue;
        }
      }
      return fieldValue;
    });
  },
  list: req => {
    paginationTransformer(req);
  }
};

