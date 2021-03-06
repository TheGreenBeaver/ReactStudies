'use strict';
const {
  Model
} = require('sequelize');
const { getUpdateReflectorHook } = require('../util/sql');
module.exports = (sequelize, DataTypes) => {
  class ReactSolutionResult extends Model {
    static associate({ SolutionResult }) {
      this.belongsTo(SolutionResult, {
        foreignKey: { name: 'basic_result_id', allowNull: false },
        as: 'basicResult'
      });
    }
  }
  ReactSolutionResult.init({
    failedAt: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    listDataPercentage: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    listDumpPercentage: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    singleDataPercentage: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    singleDumpPercentage: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'react_solution_result',
    modelName: 'ReactSolutionResult',
    timestamps: false,
    hooks: { afterUpdate: getUpdateReflectorHook('Result') }
  });
  return ReactSolutionResult;
};
