const { AuthToken, User } = require('../models');
const { StatusError } = require('./custom-errors');
const { TOKEN_AUTHORIZATION, USER_AUTHENTICATION } = require('./query-options');
const httpStatus = require('http-status');
const { compareHashed } = require('./encrypt');
const { NON_FIELD_ERRORS } = require('../settings');


function extractToken(req) {
  const header = req.get('Authorization');
  return header ? header.replace('Token ', '') : null;
}

async function authorize(token) {
  return AuthToken.findByPk(token, {
    ...TOKEN_AUTHORIZATION,
    rejectOnEmpty: new StatusError(httpStatus.UNAUTHORIZED)
  });
}

async function authenticate({ email, password }, res) {
  const user = await User.findOne({
    where: { email },
    ...USER_AUTHENTICATION,
    rejectOnEmpty: false
  });

  if (!user || !compareHashed(password, user.password)) {
    return res.status(httpStatus.BAD_REQUEST).json({ [NON_FIELD_ERRORS]: ['Invalid credentials'] });
  }

  const authToken = await user.createToken();
  return res.json({ token: authToken.key });
}

module.exports = {
  authorize,
  authenticate,
  extractToken
};