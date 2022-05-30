const { extractToken, authorize } = require('../util/user-identity');
const { AccessError } = require('../util/custom-errors');


function isAuthorizedProvider(shouldBeAuthorized) {
  return async (req, res, next) => {
    const token = extractToken(req);
    try {
      const authToken = await authorize(token);
      if (authToken && shouldBeAuthorized === false) {
        return next(new AccessError(shouldBeAuthorized, 'authorized'));
      }
      req.user = authToken.user;
      next();
    } catch (e) {
      next(e);
    }
  }
}

function isVerifiedProvider(shouldBeVerified) {
  return (req, res, next) => {
    const nextArgs = req.user.isVerified !== shouldBeVerified
      ? [new AccessError(shouldBeVerified, 'verified')]
      : [];
    return next(...nextArgs);
  }
}

function isTeacherProvider(shouldBeTeacher) {
  return (req, res, next) => {
    const nextArgs = req.user.isTeacher !== shouldBeTeacher
      ? [new AccessError(shouldBeTeacher, 'teacher')]
      : [];
    return next(...nextArgs);
  }
}


module.exports = {
  isAuthorized: { order: 1, provider: isAuthorizedProvider },
  isVerified: { order: 2, provider: isVerifiedProvider },
  isTeacher: { order: 3, provider: isTeacherProvider },
};
