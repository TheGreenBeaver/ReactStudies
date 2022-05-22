'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LayoutTask extends Model {
    static associate(models) {
      this.belongsTo(models.Task, {
        foreignKey: { allowNull: false, name: 'basic_task_id' },
        as: 'basicTask'
      });
      this.hasMany(models.ElementRule, {
        scope: { ruleName: models.ElementRule.RULE_NAMES.absPos },
        as: 'absPosAllowedFor'
      });
      this.hasMany(models.ElementRule, {
        scope: { ruleName: models.ElementRule.RULE_NAMES.rawSizing },
        as: 'rawSizingAllowedFor'
      });
      this.hasMany(models.ElementRule, {
        scope: { ruleName: models.ElementRule.RULE_NAMES.mustUse },
        as: 'mustUse'
      });
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
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'layout_task',
    modelName: 'LayoutTask',
    timestamps: false
  });
  return LayoutTask;
};
