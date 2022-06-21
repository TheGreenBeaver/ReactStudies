'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('layout_task', 'track_abs_pos', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    await queryInterface.addColumn('layout_task', 'track_raw_sizing', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    await queryInterface.sequelize.query(
      'UPDATE layout_task SET track_abs_pos = true WHERE abs_pos_max_usage IS NOT NULL;'
    );
    await queryInterface.sequelize.query(
      'UPDATE layout_task SET track_raw_sizing = true WHERE raw_sizing_max_usage IS NOT NULL;'
    );
    await queryInterface.addColumn('layout_solution_result', 'abs_pos_usage', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('layout_solution_result', 'raw_sizing_usage', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    // TODO: Down
  }
};
