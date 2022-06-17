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

function flagTransformer(req, flag) {
  if (flag in req.query) {
    req.query[flag] = boolTransformer(req.query[flag]);
  }
}

module.exports = { paginationTransformer, boolTransformer, flagTransformer };
