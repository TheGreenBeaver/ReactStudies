const morgan = require('morgan');
const cors = require('cors');
const { isDev } = require('../util/env');
const express = require('express');
const helmet = require('helmet');
const { FE_HOSTS, MEDIA_PATH, DISPLAY_SOLUTIONS_PATH } = require('../settings');

function apply(app) {
  const loggerFormat = isDev ? 'dev' : 'common';
  const logger = morgan(loggerFormat, {
    skip: req => [MEDIA_PATH, DISPLAY_SOLUTIONS_PATH].includes(req.baseUrl)
  });

  const jsonBodyParser = express.json();
  const formBodyParser = express.urlencoded({
    extended: false
  });

  const securityHeaders = helmet({
    crossOriginResourcePolicy: { policy: isDev? 'cross-origin' : 'same-site' }
  });

  const stack = [
    logger,
    jsonBodyParser,
    formBodyParser,
    securityHeaders
  ];

  if (isDev) {
    stack.push(cors({ origin: FE_HOSTS }));
  }

  app.use(...stack);
}

module.exports = apply;