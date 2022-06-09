'use strict';
const {
  Model
} = require('sequelize');
const { composeMediaPath } = require('../util/misc');
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
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('location');
        return composeMediaPath(rawValue);
      }
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
