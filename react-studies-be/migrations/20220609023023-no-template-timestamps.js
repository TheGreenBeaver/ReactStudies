'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('template_config', 'created_at');
    await queryInterface.removeColumn('template_config', 'updated_at');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('template_config', 'created_at', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });
    await queryInterface.addColumn('template_config', 'updated_at', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });
  }
};
