'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('react_solution_result', 'single_dump_percentage', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
    await queryInterface.addColumn('react_solution_result', 'list_dump_percentage', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('react_solution_result', 'single_dump_percentage');
    await queryInterface.removeColumn('react_solution_result', 'list_dump_percentage');
  }
};
