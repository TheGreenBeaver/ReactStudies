'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('fs_user', 'git_hub_user_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('task', 'repo_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    });
    await queryInterface.addColumn('solution', 'repo_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('fs_user', 'git_hub_user_id');
    await queryInterface.removeColumn('task', 'repo_id');
    await queryInterface.removeColumn('solution', 'repo_id');
  }
};
