'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('solution_result', 'is_processed', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    await queryInterface.sequelize.query(
      'UPDATE solution_result SET is_processed = true WHERE unprocessed_report_location IS NULL;'
    );
    await queryInterface.removeColumn('solution_result', 'unprocessed_report_location');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('solution_result', 'unprocessed_report_location', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.sequelize.query(
      "UPDATE solution_result SET unprocessed_report_location = 'report-for-' || id || '.zip' WHERE is_processed = false;"
    );
    await queryInterface.removeColumn('solution_result', 'is_processed');
  }
};
