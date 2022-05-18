const { extractToken, authorize } = require('../util/user-identity');
const applyToRouter = require('./apply-to-router');

async function authorizationProvider(req, res, next) {
  const token = extractToken(req);
  try {
    const { user } = await authorize(token);
    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
}

function apply(router, routes) {
  applyToRouter(authorizationProvider, router, routes);
}

module.exports = apply;