const { paginationTransformer } = require('../../util/transformers');


module.exports = {
  list: req => {
    paginationTransformer(req);
    if ('taskId' in req.query) {
      req.query.taskId = parseInt(req.query.taskId);
    }
  }
};
