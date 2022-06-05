'use strict';
const { underscores } = require('../util/sql');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('template_config', underscores({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      kind: {
        type: Sequelize.ENUM,
        values: ['auth', 'entity_list', 'single_entity'],
        allowNull: false
      },
      endpoints: {
        type: Sequelize.ARRAY(Sequelize.STRING(2000)),
        allowNull: true
      },
      routes: {
        type: Sequelize.ARRAY(Sequelize.STRING(2000)),
        allowNull: true
      },
      special: {
        type: Sequelize.STRING(2000),
        allowNull: true
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
    await queryInterface.dropTable('template_config');
  }
};
