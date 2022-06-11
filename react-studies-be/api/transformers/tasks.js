const mapValues = require('lodash/mapValues');
const fs = require('fs');
const { paginationTransformer, boolTransformer } = require('../../util/transformers');


module.exports = {
  create: async req => {
    req.body = mapValues(req.body, (fieldValue, fieldName) => {
      if (['attachmentNames'].includes(fieldName)) {
        return Array.isArray(fieldValue) ? fieldValue : [fieldValue];
      }
      if ([
        'absPos',
        'rawSizing',
        'authTemplate',
        'entityListTemplate',
        'singleEntityTemplate'
      ].includes(fieldName)) {
        return JSON.parse(fieldValue);
      }
      if (['mustUse'].includes(fieldName)) {
        const adjusted = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
        return adjusted.map(el => JSON.parse(el));
      }
      if ([
        'rememberToken',
        'trackUpdates',

        'hasFuzzing',
        'dumpIsTemplate'
      ].includes(fieldName)) {
        return boolTransformer(fieldValue);
      }
      return fieldValue;
    });
    if (req.files.fileDump) {
      req.body.dump = await fs.promises.readFile(req.files.fileDump[0].path, 'utf8');
      await fs.promises.rm(req.files.fileDump[0].path);
      delete req.files.fileDump;
    }
  },
  list: req => {
    paginationTransformer(req);
    if ('teacherId' in req.query) {
      req.query.teacherId = parseInt(req.query.teacherId);
    }
  },
  retrieve: req => {
    if ('mini' in req.query) {
      req.query.mini = boolTransformer(req.query.mini);
    }
  }
};

