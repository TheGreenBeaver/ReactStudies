'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('fs_user', 'git_hub_user_id');
    await queryInterface.addColumn('solution', 'awaiting_token', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('fs_user', 'git_hub_user_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.removeColumn('solution', 'awaiting_token');
  }
};
