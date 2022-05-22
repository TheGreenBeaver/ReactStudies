const initRouter = require('./_init-router');
const { authenticate, extractToken } = require('../util/user-identity');
const { AuthToken } = require('../models');
const httpStatus = require('http-status');
const paths = require('./_paths');


const router = initRouter(__filename, ['/log_out']);

router.post(paths.signIn, (req, res, next) => {
  try {
    return authenticate(req.body, res);
  } catch (e) {
    next(e);
  }
});

router.post(paths.logOut, async (req, res, next) => {
  try {
    // More compact than storing the whole AuthToken object in the request; a DB request is performed anyway
    await AuthToken.destroy({ where: { key: extractToken(req) } });
    return res.status(httpStatus.NO_CONTENT).end();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
