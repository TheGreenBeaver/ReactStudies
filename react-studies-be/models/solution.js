'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Solution extends Model {
    static associate({ User, Task }) {
      this.belongsTo(User, {
        foreignKey: { allowNull: false, name: 'student_id' },
        as: 'student'
      });
      this.belongsTo(Task, {
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
