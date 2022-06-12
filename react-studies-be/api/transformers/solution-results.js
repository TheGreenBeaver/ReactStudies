const { paginationTransformer } = require('../../util/transformers');


module.exports = {
  list: req => {
    paginationTransformer(req);
    req.query.solutionId = parseInt(req.query.solutionId);
  }
};
