'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('layout_task', 'raw_sizing_max_usage', {
      allowNull: true,
      type: Sequelize.INTEGER,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('layout_task', 'raw_sizing_max_usage', {
      allowNull: false,
      defaultValue: 40,
      type: Sequelize.INTEGER,
    });
  }
};
