'use strict';
const { underscores } = require('../util/sql');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('react_task', underscores({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      includeFuzzing: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
    }));
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('react_task');
  }
};
