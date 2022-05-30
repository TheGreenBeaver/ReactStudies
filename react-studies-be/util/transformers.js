function paginationTransformer(req) {
  ['page', 'pageSize'].forEach(field => {
    if (field in req.query) {
      req.query[field] = parseInt(req.query[field]);
    }
  });
}

module.exports = { paginationTransformer };
