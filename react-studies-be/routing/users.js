const express = require('express');
const { User } = require('../models');
const { hash, getB36, generateToken, parseB36, checkToken, TOKEN_STATUS } = require('../util/encrypt');
const sendMail = require('../mail');
const { getHost } = require('../util/misc');
const { authenticate } = require('../util/user-identity');
const applyAuthorization = require('../middleware/authorization');
const httpStatus = require('http-status');
const { NON_FIELD_ERRORS } = require('../settings');
const { capitalize } = require('lodash');


const CRYPTO_FIELDS = ['email', 'firstName', 'lastName'];

const router = express.Router();

applyAuthorization(router, ['/me']);

router.post('/', async (req, res, next) => {
  try {
    const newUser = User.build(req.body);
    await newUser.validate();

    const encryptedPassword = hash(req.body.password);
    newUser.setDataValue('password', encryptedPassword);

    const savedUser = await newUser.save();

    const verificationToken = generateToken(savedUser, CRYPTO_FIELDS);
    const link = `${getHost()}/confirm/verify/${getB36(savedUser.id)}/${verificationToken}`;
    await sendMail(link);

    await authenticate({ email: savedUser.email, password: req.body.password }, res);
  } catch (e) {
    next(e);
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    const user = await User.findByPk(parseB36(req.body.uid));
    const status = checkToken(user, req.body.token, CRYPTO_FIELDS);
    if (status === TOKEN_STATUS.OK) {
      user.isVerified = true;
      await user.save();
      return res.json({ isVerified: user.isVerified });
    }
    return res.status(httpStatus.BAD_REQUEST).json({ [NON_FIELD_ERRORS]: [`${capitalize(status)} Link`] });
  } catch (e) {
    next(e);
  }
});

router.get('/me', (req, res) =>
  res.json(req.user)
);

module.exports = router;