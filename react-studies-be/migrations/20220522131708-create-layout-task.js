'use strict';
const { underscores } = require('../util/sql');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('layout_task', underscores({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sampleImage: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      absPosMaxUsage: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      rawSizingMaxUsage: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    }));
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('layout_task');
  }
};
