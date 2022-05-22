'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ElementRule extends Model {
    static RULE_NAMES = {
      absPos: 'abs_pos',
      rawSizing: 'raw_sizing',
      mustUse: 'must_use'
    };

    static associate(models) {
      this.belongsTo(models.LayoutTask, {
        foreignKey: { allowNull: false, name: 'task_id' },
        as: 'task'
      });
    }
  }
  ElementRule.init({
    ruleName: {
      type: DataTypes.ENUM,
      values: Object.values(ElementRule.RULE_NAMES),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tag: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ElementRule',
    tableName: 'element_rule',
    timestamps: false
  });
  return ElementRule;
};
