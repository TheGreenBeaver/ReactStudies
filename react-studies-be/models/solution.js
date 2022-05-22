'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Solution extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: { allowNull: false, name: 'student_id' },
        as: 'student'
      });
      this.belongsTo(models.Task, {
        foreignKey: { allowNull: false, name: 'task_id' },
        as: 'task'
      });
    }
  }
  Solution.init({
    repoUrl: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Solution',
    tableName: 'solution'
  });
  return Solution;
};
