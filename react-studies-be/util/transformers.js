function paginationTransformer(req) {
  ['page', 'pageSize'].forEach(field => {
    if (field in req.query) {
      req.query[field] = parseInt(req.query[field]);
    }
  });
}

function boolTransformer(value) {
  switch (value) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return value;
  }
}

module.exports = { paginationTransformer, boolTransformer };
