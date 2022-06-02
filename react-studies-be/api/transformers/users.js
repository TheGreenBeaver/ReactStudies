const { paginationTransformer, boolTransformer } = require('../../util/transformers');


module.exports = {
  retrieve: req => {
    if ('mini' in req.query) {
      req.query.mini = boolTransformer(req.query.mini);
    }
  },
  list: req => {
    paginationTransformer(req);
    if ('isTeacher' in req.query) {
      req.query.isTeacher = boolTransformer(req.query.isTeacher);
    }
  }
}
