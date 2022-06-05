'use strict';
const { underscores } = require('../util/sql');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('task_attachment', underscores({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      location: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      mime: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      refName: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
    }));
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('task_attachment');
  }
};
