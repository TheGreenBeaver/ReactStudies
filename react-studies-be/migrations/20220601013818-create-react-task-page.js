'use strict';
const { underscores } = require('../util/sql');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('react_task_page', underscores({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      dump: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      dumpIsFile: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      dumpIsTemplate: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      endpoints: {
        type: Sequelize.ARRAY(Sequelize.STRING(2000)),
        allowNull: true
      },
      template: {
        type: Sequelize.ENUM,
        values: ['sign_in', 'sign_up', 'entity_list', 'single_entity'],
        allowNull: false
      },
      route: {
        type: Sequelize.STRING(2000),
        allowNull: true
      }
    }));
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('react_task_page');
  }
};
