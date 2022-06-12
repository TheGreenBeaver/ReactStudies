'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('template_config', 'task_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    // TODO: Down
  }
};
