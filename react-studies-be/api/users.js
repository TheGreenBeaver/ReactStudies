const initRouter = require('./_init-router');
const { User } = require('../models');
const { getB36, generateToken, parseB36, checkToken, TOKEN_STATUS, hash } = require('../util/encrypt');
const sendMail = require('../mail');
const { getHost } = require('../util/misc');
const { authenticate } = require('../util/user-identity');
const httpStatus = require('http-status');
const { NON_FIELD_ERRORS } = require('../settings');
const { capitalize } = require('lodash');
const paths = require('./_paths');


const router = initRouter(__filename, ['/me']);

const CRYPTO_FIELDS = ['email', 'firstName', 'lastName'];

router.post(paths.root, async (req, res, next) => {
  try {
    const newUser = await User.create({ ...req.body, password: hash(req.body.password) });

    const verificationToken = generateToken(newUser, CRYPTO_FIELDS);
    const link = `${getHost()}/confirm/verify/${getB36(newUser.id)}/${verificationToken}`;
    await sendMail(link);

    await authenticate({ email: newUser.email, password: req.body.password }, res);
  } catch (e) {
    next(e);
  }
});

router.post(paths.verify, async (req, res, next) => {
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

router.get(paths.me, (req, res) =>
  res.json(req.user)
);

router.patch(paths.me, (req, res, next) => {

});

module.exports = router;
