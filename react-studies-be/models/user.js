'use strict';
const {
  Model
} = require('sequelize');
const { Octokit } = require('octokit');
const { GITHUB_USER_AGENT } = require('../settings');
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
    timestamps: false,
    hooks: {
      beforeUpdate: async (instance, options) => {
        const changedFields = instance.changed();
        if (changedFields !== false && changedFields.includes('gitHubToken')) {
          const octokit = new Octokit({ userAgent: GITHUB_USER_AGENT, auth: instance.gitHubToken });
          const { data: gitHubUser } = await octokit.rest.users.getAuthenticated();
          instance.gitHubUserId = gitHubUser.id;
        }
      }
    }
  });
  return User;
};
