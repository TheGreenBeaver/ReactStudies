'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LayoutSolutionResult extends Model {
    static SUMMARY = {
      good: 'good',
      medium: 'medium',
      bad: 'bad',
    };

    static associate({ Solution }) {
      this.belongsTo(Solution, {
        foreignKey: { name: 'solution_id', allowNull: false },
        as: 'solution'
      });
    }
  }
  LayoutSolutionResult.init({
    unprocessedReportLocation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    runId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    diffLocation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reportLocation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    summary: {
      type: DataTypes.ENUM,
      values: Object.values(LayoutSolutionResult.SUMMARY),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'layout_solution_result',
    modelName: 'LayoutSolutionResult',
  });
  return LayoutSolutionResult;
};
