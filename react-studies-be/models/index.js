'use strict';

const path = require('path');
const Sequelize = require('sequelize');
const { listUsableFiles } = require('../util/misc');
const { getEnv } = require('../util/env');
const allConfigs = require(__dirname + '/../config/config')


const env = getEnv();
const config = allConfigs[env];
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const db = listUsableFiles(__dirname, __filename).reduce((res, file) => {
  const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
  return { ...res, [model.name]: model };
}, {});

Object.values(db).forEach(model => {
  model.associate?.(db);
});

db.sequelize = sequelize;

module.exports = db;
