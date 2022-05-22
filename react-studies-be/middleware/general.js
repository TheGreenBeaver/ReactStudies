const morgan = require('morgan');
const cors = require('cors');
const { isDev } = require('../util/env');
const express = require('express');
const helmet = require('helmet');
const { FE_HOSTS } = require('../settings');

function apply(app) {
  const loggerFormat = isDev ? 'dev' : 'common';
  const logger = morgan(loggerFormat);

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
