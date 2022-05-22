'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.hasMany(models.AuthToken, { as: 'authTokens' });
      this.hasMany(models.Solution, { as: 'solutions' });
      this.hasMany(models.Task, { as: 'tasks' });
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    firstName: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    isTeacher: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    password: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    gutHubToken: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    newPassword: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'rs_user',
    timestamps: false
  });
  return User;
};
