const { AuthToken, User } = require('../models');
const { StatusError } = require('./custom-errors');
const httpStatus = require('http-status');
const { compareHashed } = require('./encrypt');
const { NON_FIELD_ERR } = require('../settings');
const { AuthToken_Authorization, User_Authentication } = require('./query-options');


function extractToken(req) {
  const header = req.get('Authorization');
  return header ? header.replace('Token ', '') : null;
}

async function authorize(token) {
  return AuthToken.findByPk(token,{
    ...AuthToken_Authorization,
    rejectOnEmpty: new StatusError(httpStatus.UNAUTHORIZED)
  });
}

async function authenticate({ email, password }, res) {
  const user = await User.findOne({ where: { email }, ...User_Authentication, rejectOnEmpty: false });

  if (!user || !compareHashed(password, user.password)) {
    return res.status(httpStatus.BAD_REQUEST).json({ [NON_FIELD_ERR]: ['Invalid credentials'] });
  }

  const authToken = await user.createAuthToken();
  return res.json({ token: authToken.key });
}

module.exports = {
  authorize,
  authenticate,
  extractToken
};
