'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('solution_result', 'run_id', {
      type: Sequelize.BIGINT,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('solution_result', 'run_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
};
