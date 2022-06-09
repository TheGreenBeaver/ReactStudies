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

    static associate({ User, Solution, ReactTask, LayoutTask, TaskAttachment }) {
      this.belongsTo(User, {
        foreignKey: { allowNull: false, name: 'teacher_id' },
        as: 'teacher'
      });
      this.hasMany(Solution, { as: 'solutions', foreignKey: 'task_id' });
      this.hasOne(ReactTask, { as: 'reactTask', foreignKey: 'basic_task_id' });
      this.hasOne(LayoutTask, { as: 'layoutTask', foreignKey: 'basic_task_id' });
      this.hasMany(TaskAttachment, { as: 'attachments', foreignKey: 'task_id' });
    }
  }
  Task.init({
    title: {
      type: DataTypes.STRING(39),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    repoUrl: {
      type: DataTypes.STRING(2000),
      allowNull: false
    },
    repoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    trackUpdates: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Task',
    tableName: 'task'
  });
  return Task;
};
