const mapValues = require('lodash/mapValues');
const { paginationTransformer, boolTransformer } = require('../../util/transformers');


module.exports = {
  create: req => {
    req.body = mapValues(req.body, (fieldValue, fieldName) => {
      if (['absPos', 'rawSizing'].includes(fieldName)) {
        return JSON.parse(fieldValue);
      }
      if (['mustUse', 'pages'].includes(fieldName)) {
        const adjusted = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
        return adjusted.map(el => JSON.parse(el));
      }
      if (['rememberToken', 'trackUpdates', 'includeFuzzing'].includes(fieldName)) {
        return boolTransformer(fieldValue);
      }
      return fieldValue;
    });
  },
  list: req => {
    paginationTransformer(req);
    if ('teacherId' in req.query) {
      req.query.teacherId = parseInt(req.query.teacherId);
    }
  }
};

