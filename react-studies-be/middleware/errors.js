const httpStatus = require('http-status');
const { CustomError } = require('../util/custom-errors');
const { EmptyResultError, UniqueConstraintError, ValidationError } = require('sequelize');
const allModels = require('../models');
const { isDev } = require('../util/env');


function getFailedUnique(sqlData) {
  return sqlData.constraint
    .replace(`${sqlData.table}_`, '')
    .replace('_key', '');
}

function handleUniqueConstraintError(err, req, res, next) {
  if (err instanceof UniqueConstraintError) {
    const { parent } = err;
    const failedUnique = getFailedUnique(parent);
    const failedModel = Object.values(allModels).find(model => model.tableName === parent.table).modelName;
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ [failedUnique]: [`${failedModel} with such ${failedUnique} already exists`] });
  }

  next(err);
}

function getValidationErrJson(validationResult) {
  return validationResult.errors.reduce((acc, err) => {
    if (!acc[err.path]) {
      acc[err.path] = [];
    }
    acc[err.path].push(err.message);
    return acc;
  }, {});
}

function handleValidationError(err, req, res, next) {
  if (err instanceof ValidationError) {
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
    handleUniqueConstraintError,
    handleValidationError,
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