'use strict';
const {
  Model, UniqueConstraintError
} = require('sequelize');
const { generateRandomString } = require('../util/encrypt');
module.exports = (sequelize, DataTypes) => {
  class AuthToken extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: { allowNull: false, name: 'user_id' },
        as: 'user'
      });
    }

    static async create(values, options) {
      while (true) {
        const key = generateRandomString(20);
        try {
          return await super.create({ ...values, key }, options);
        } catch (e) {
          if (!(e instanceof UniqueConstraintError)) {
            throw e;
          }
        }
      }
    }
  }
  AuthToken.init({
    key: {
      type: DataTypes.STRING(40),
      primaryKey: true,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'AuthToken',
    tableName: 'auth_token',
    timestamps: true,
    updatedAt: false
  });
  return AuthToken;
};
