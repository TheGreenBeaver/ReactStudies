'use strict';
const {
  Model
} = require('sequelize');
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
      allowNull: true
    },
    reportLocation: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'layout_solution_result',
    modelName: 'LayoutSolutionResult',
    timestamps: false
  });
  return LayoutSolutionResult;
};
