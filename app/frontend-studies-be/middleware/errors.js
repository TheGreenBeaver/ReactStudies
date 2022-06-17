const httpStatus = require('http-status');
const { CustomError } = require('../util/custom-errors');
const { EmptyResultError, UniqueConstraintError, ValidationError: SqlValidationError } = require('sequelize');
const { ValidationError: YupValidationError } = require('yup');
const allModels = require('../models');
const { isDev } = require('../util/env');
const set = require('lodash/set');
const groupBy = require('lodash/groupBy');
const { NON_FIELD_ERR, GITHUB_ERR } = require('../settings');


function handleGitHubError(err, req, res, next) {
  if (err.response?.url?.startsWith('https://api.github.com')) {
    return res.status(err.response.status).send({ [GITHUB_ERR]: true, ...err.response.data });
  }

  next(err);
}

function getFailedUnique(sqlData) {
  return sqlData.constraint
    .replace(`${sqlData.table}_`, '')
    .replace('_key', '');
}

function handleUniqueConstraintError(err, req, res, next) {
  if (err instanceof UniqueConstraintError) {
    const { parent } = err;
    const failedUnique = getFailedUnique(parent);
    const failedModel = Object.values(allModels).find(model => model.tableName === parent.table).name;
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ [failedUnique]: [`${failedModel} with such ${failedUnique} already exists`] });
  }

  next(err);
}

function handleYupValidationError(err, req, res, next) {
  if (err instanceof YupValidationError) {
    const payload = {};
    err.inner.forEach(innerErr => {
      set(payload, innerErr.path || NON_FIELD_ERR, innerErr.errors);
    });
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(payload);
  }

  next(err);
}

function getValidationErrJson(validationResult) {
  return groupBy(validationResult.errors, 'path');
}

function handleSqlValidationError(err, req, res, next) {
  if (err instanceof SqlValidationError) {
    return res.status(httpStatus.BAD_REQUEST).json(getValidationErrJson(err));
  }

  next(err);
}

function handleCustomError(err, req, res, next) {
  if (err instanceof CustomError) {
    return err.send(res);
  }

  next(err);
}

function handleNotFoundError(err, req, res, next) {
  if (err instanceof EmptyResultError) {
    return res.status(httpStatus.NOT_FOUND).end();
  }

  next(err);
}

function handleUnknownError(err, req, res, next) {
  return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
}

function logFullError(err, req, res, next) {
  console.log(err);
  next(err);
}

function apply(app) {
  const stack = [
    handleGitHubError,
    handleUniqueConstraintError,
    handleYupValidationError,
    handleSqlValidationError,
    handleCustomError,
    handleNotFoundError,
    handleUnknownError
  ];
  if (isDev) {
    stack.unshift(logFullError);
  }

  app.use(...stack);
}

module.exports = apply;
