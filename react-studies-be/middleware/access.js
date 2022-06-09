const { extractToken, authorize } = require('../util/user-identity');
const { AccessError, StatusError } = require('../util/custom-errors');
const httpStatus = require('http-status');


function neverAllowedProvider() {
  return (_, res) => res.status(httpStatus.METHOD_NOT_ALLOWED).end()
}

function isAuthorizedProvider(shouldBeAuthorized) {
  return async (req, res, next) => {
    const token = extractToken(req);
    try {
      const authToken = await authorize(token);
      if (authToken && shouldBeAuthorized === false) {
        return next(new AccessError(shouldBeAuthorized, 'authorized'));
      }
      if (shouldBeAuthorized === true) {
        req.user = authToken.user;
      }
      next();
    } catch (e) {
      if (e instanceof StatusError && shouldBeAuthorized === false) {
        return next();
      }
      next(e);
    }
  }
}

function isVerifiedProvider(shouldBeVerified) {
  return (req, res, next) => {
    const nextArgs = req.user && req.user.isVerified !== shouldBeVerified
      ? [new AccessError(shouldBeVerified, 'verified')]
      : [];
    return next(...nextArgs);
  }
}

function isTeacherProvider(shouldBeTeacher) {
  return (req, res, next) => {
    const nextArgs = req.user && req.user.isTeacher !== shouldBeTeacher
      ? [new AccessError(shouldBeTeacher, 'teacher')]
      : [];
    return next(...nextArgs);
  }
}


module.exports = {
  never: { order: 0, provider: neverAllowedProvider },
  isAuthorized: { order: 1, provider: isAuthorizedProvider },
  isVerified: { order: 2, provider: isVerifiedProvider },
  isTeacher: { order: 3, provider: isTeacherProvider },
};
