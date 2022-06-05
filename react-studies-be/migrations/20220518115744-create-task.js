'use strict';
const { underscores } = require('../util/sql');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('task', underscores({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(39),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      repoUrl: {
        type: Sequelize.STRING(2000),
        allowNull: false
      },
      trackUpdates: {
        type:Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.dropTable('task');
  }
};
