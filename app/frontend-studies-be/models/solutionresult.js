'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SolutionResult extends Model {
    static SUMMARY = {
      good: 'good',
      medium: 'medium',
      bad: 'bad',
    };

    static associate({ LayoutSolutionResult, ReactSolutionResult, Solution }) {
      this.hasOne(LayoutSolutionResult, {
        as: 'layoutResult', foreignKey: 'basic_result_id'
      });
      this.hasOne(ReactSolutionResult, {
        as: 'reactResult', foreignKey: 'basic_result_id'
      });
      this.belongsTo(Solution, {
        foreignKey: { allowNull: false, name: 'solution_id' },
        as: 'solution'
      });
    }
  }
  SolutionResult.init({
    isProcessed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    runId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    summary: {
      type: DataTypes.ENUM,
      values: Object.values(SolutionResult.SUMMARY),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'solution_result',
    modelName: 'SolutionResult',
  });
  return SolutionResult;
};
