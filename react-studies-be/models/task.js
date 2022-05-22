'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static TASK_KINDS = {
      layout: 'layout',
      react: 'react',
    };

    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: { allowNull: false, name: 'teacher_id' },
        as: 'teacher'
      });
      this.hasMany(models.Solution, { as: 'solutions' });
      this.hasOne(models.ReactTask, { as: 'reactTask' });
      this.hasOne(models.LayoutTask, { as: 'layoutTask' });
      this.hasMany(models.TaskAttachment, { as: 'attachments' });
    }
  }
  Task.init({
    title: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(1500),
      allowNull: true
    },
    repoUrl: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Task',
    tableName: 'task'
  });
  return Task;
};
