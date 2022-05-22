const express = require('express');
const applyAuthorization = require('../middleware/authorization');
const applyValidation = require('./validation');


function initRouter(filename, auth) {
  const router = express.Router();

  if (auth !== false) {
    applyAuthorization(router, auth);
  }

  if (filename) {
    applyValidation(filename, router);
  }

  return router;
}

module.exports = initRouter;
