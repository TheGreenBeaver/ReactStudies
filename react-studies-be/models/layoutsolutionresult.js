'use strict';
const {
  Model
} = require('sequelize');
const { composeMediaPath } = require('../util/misc');
module.exports = (sequelize, DataTypes) => {
  class LayoutSolutionResult extends Model {
    static associate({ SolutionResult }) {
      this.belongsTo(SolutionResult, {
        foreignKey: { name: 'basic_result_id', allowNull: false },
        as: 'basicResult'
      });
    }
  }
  LayoutSolutionResult.init({
    diffLocation: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('diffLocation');
        return composeMediaPath(rawValue);
      }
    },
    reportLocation: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('reportLocation');
        return composeMediaPath(rawValue);
      }
    }
  }, {
    sequelize,
    tableName: 'layout_solution_result',
    modelName: 'LayoutSolutionResult',
    timestamps: false
  });
  return LayoutSolutionResult;
};
