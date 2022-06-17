'use strict';
const { underscores } = require('../util/sql');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('element_rule', underscores({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kind: {
        type: Sequelize.ENUM,
        values: ['abs_pos', 'raw_sizing', 'must_use'],
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tag: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
    }));
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('element_rule');
  }
};
