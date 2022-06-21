'use strict';
const {
  Model
} = require('sequelize');
const { composeMediaPath } = require('../util/misc');
const { getUpdateReflectorHook } = require('../util/sql');
module.exports = (sequelize, DataTypes) => {
  class LayoutTask extends Model {
    static associate({ ElementRule, Task }) {
      this.belongsTo(Task, {
        foreignKey: { allowNull: false, name: 'basic_task_id' },
        as: 'basicTask'
      });

      this.hasMany(ElementRule, { as: 'elementRules', foreignKey: 'task_id' });
    }
  }
  LayoutTask.init({
    sampleImage: {
      allowNull: false,
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('sampleImage');
        return composeMediaPath(rawValue);
      }
    },
    absPosMaxUsage: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rawSizingMaxUsage: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    trackAbsPos: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    trackRawSizing: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
  }, {
    sequelize,
    tableName: 'layout_task',
    modelName: 'LayoutTask',
    timestamps: false,
    hooks: { afterUpdate: getUpdateReflectorHook('Task') }
  });
  return LayoutTask;
};
