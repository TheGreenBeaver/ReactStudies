'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Solution extends Model {
    static associate({ User, Task, TemplateConfig, LayoutSolutionResult }) {
      this.belongsTo(User, {
        foreignKey: { allowNull: false, name: 'student_id' },
        as: 'student'
      });
      this.belongsTo(Task, {
        foreignKey: { allowNull: false, name: 'task_id' },
        as: 'task'
      });
      this.hasMany(TemplateConfig, { foreignKey: 'solution_id', as: 'studentTemplateConfigs' });
      this.hasMany(LayoutSolutionResult, {
        foreignKey: 'solution_id', as: 'layoutResults'
      })
    }
  }
  Solution.init({
    repoUrl: {
      type: DataTypes.STRING(2000),
      allowNull: false
    },
    repoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dumpUploadUrl: {
      type: DataTypes.STRING(2000),
      allowNull: true
    },
    dumpUploadMethod: {
      type: DataTypes.ENUM,
      values: ['post', 'put', 'patch'],
      allowNull: true
    },
    awaitingToken: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Solution',
    tableName: 'solution'
  });
  return Solution;
};
