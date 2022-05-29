'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReactTask extends Model {
    static associate({ Task }) {
      this.belongsTo(Task, {
        foreignKey: { allowNull: false, name: 'basic_task_id' },
        as: 'basicTask'
      });
    }
  }
  ReactTask.init({
    includeFuzzing: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    }
  }, {
    sequelize,
    tableName: 'react_task',
    timestamps: false,
    modelName: 'ReactTask',
  });
  return ReactTask;
};
