'use strict';
const {
  Model
} = require('sequelize');
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
      type: DataTypes.TEXT
    },
    absPosMaxUsage: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rawSizingMaxUsage: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'layout_task',
    modelName: 'LayoutTask',
    timestamps: false,
    hooks: {
      afterUpdate: async (instance, options) => {
        const basicTask = await instance.getBasicTask();
        basicTask.updatedAt = new Date();
        await basicTask.save();
      }
    }
  });
  return LayoutTask;
};
