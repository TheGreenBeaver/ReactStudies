'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ElementRule extends Model {
    static RULE_KINDS = {
      absPos: 'abs_pos',
      rawSizing: 'raw_sizing',
      mustUse: 'must_use'
    };

    static associate({ LayoutTask }) {
      this.belongsTo(LayoutTask, {
        foreignKey: { allowNull: false, name: 'task_id' },
        as: 'task'
      });
    }
  }
  ElementRule.init({
    kind: {
      type: DataTypes.ENUM,
      values: Object.values(ElementRule.RULE_KINDS),
      allowNull: false
    },
    content: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('content');
        return rawValue
          ? JSON.parse(rawValue.replace(/(^{)|(}$)/g, match => ({ '{': '[', '}': ']' }[match])))
          : null;
      }
    },
    tag: {
      type: DataTypes.STRING(20),
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
