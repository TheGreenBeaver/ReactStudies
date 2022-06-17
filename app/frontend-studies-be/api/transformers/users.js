const { paginationTransformer, flagTransformer } = require('../../util/transformers');


module.exports = {
  retrieve: req => {
    flagTransformer(req, 'mini');
  },
  list: req => {
    paginationTransformer(req);
    flagTransformer(req, 'isTeacher');
  }
}
