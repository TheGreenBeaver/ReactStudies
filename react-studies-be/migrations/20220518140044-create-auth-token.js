'use strict';
const { underscores } = require('../util/sql');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auth_token', underscores({
      key: {
        type: Sequelize.STRING(40),
        allowNull: false,
        primaryKey: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    }));
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('auth_token');
  }
};
