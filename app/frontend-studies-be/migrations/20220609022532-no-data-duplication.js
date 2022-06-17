'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('solution', 'awaiting_token');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('solution', 'awaiting_token', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  }
};
