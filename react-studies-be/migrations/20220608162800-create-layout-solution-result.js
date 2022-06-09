'use strict';
const { underscores } = require('../util/sql');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('layout_solution_result', underscores({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      unprocessedReportLocation: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      diffLocation: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      reportLocation: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      summary: {
        type: Sequelize.ENUM,
        values: ['good', 'medium', 'bad'],
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }));
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('layout_solution_result');
  }
};
