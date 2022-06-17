'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate({ AuthToken, Solution, Task }) {
      this.hasMany(AuthToken, { as: 'authTokens', foreignKey: 'user_id' });
      this.hasMany(Solution, { as: 'solutions', foreignKey: 'student_id' });
      this.hasMany(Task, { as: 'tasks', foreignKey: 'teacher_id' });
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
    gitHubToken: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    newPassword: {
      type: DataTypes.STRING(64),
      allowNull: true,
      get() {
        return !!this.getDataValue('newPassword');
      }
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'fs_user',
    timestamps: false
  });
  return User;
};
