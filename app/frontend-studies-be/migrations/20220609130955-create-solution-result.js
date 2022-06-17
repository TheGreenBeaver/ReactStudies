'use strict';
const { underscores } = require('../util/sql');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('solution_result', underscores({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      unprocessedReportLocation: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      runId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      summary: {
        type: Sequelize.ENUM,
        values: Object.values(['good', 'medium', 'bad']),
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    }));
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('solution_result');
  }
};
