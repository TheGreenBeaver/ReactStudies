'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TaskAttachment extends Model {
    static associate(models) {
      this.belongsTo(models.Task, {
        foreignKey: { allowNull: false, name: 'task_id' },
        as: 'task'
      });
    }
  }
  TaskAttachment.init({
    location: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    mime: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    refName: {
      type: DataTypes.STRING(30),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'task_attachment',
    timestamps: false,
    modelName: 'TaskAttachment',
  });
  return TaskAttachment;
};
