const express = require('express');
const applyAuthorization = require('../middleware/authorization');
const { authenticate, extractToken } = require('../util/user-identity');
const { AuthToken } = require('../models');
const httpStatus = require('http-status');


const router = express.Router();

applyAuthorization(router, ['/log_out']);

router.post('/sign_in', (req, res, next) => {
  try {
    return authenticate(req.body, res);
  } catch (e) {
    next(e);
  }
});

router.post('/log_out', async (req, res, next) => {
  try {
    // More compact than storing the whole AuthToken object in the request; a DB request is performed anyway
    await AuthToken.destroy({ where: { key: extractToken(req) } });
    return res.status(httpStatus.NO_CONTENT).end();
  } catch (e) {
    next(e);
  }
});

module.exports = router;