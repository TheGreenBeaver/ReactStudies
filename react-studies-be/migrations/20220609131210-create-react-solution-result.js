'use strict';
const { underscores } = require('../util/sql');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('react_solution_result', underscores({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      failedAt: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      listDataPercentage: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      singleDataPercentage: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
    }));
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('react_solution_result');
  }
};
