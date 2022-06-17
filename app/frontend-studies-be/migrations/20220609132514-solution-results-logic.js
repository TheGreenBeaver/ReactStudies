'use strict';
const { getFkOperations } = require('../util/sql');


const basicResultToSolution = getFkOperations('solution_result', 'solution');
const layoutResultToBasic = getFkOperations('layout_solution_result', 'solution_result', {
  key: 'basic_result_id',
  allowNull: true
});
const reactResultToBasic = getFkOperations('react_solution_result', 'solution_result', {
  key: 'basic_result_id'
});
const layoutResultToSolution = getFkOperations('layout_solution_result', 'solution');

module.exports = {
  async up (queryInterface, Sequelize) {
    await basicResultToSolution.up(queryInterface, Sequelize);
    await queryInterface.sequelize.query(`
INSERT INTO solution_result (created_at, updated_at, summary, unprocessed_report_location, run_id, solution_id)
SELECT created_at, updated_at, summary::text::enum_solution_result_summary, unprocessed_report_location, run_id, solution_id
FROM layout_solution_result;
    `);
    await layoutResultToBasic.up(queryInterface, Sequelize);
    for (const col of ['created_at', 'updated_at', 'summary', 'unprocessed_report_location', 'run_id']) {
      await queryInterface.removeColumn('layout_solution_result', col);
    }
    await queryInterface.sequelize.query(`
UPDATE layout_solution_result l_res
SET basic_result_id = (SELECT id FROM solution_result res WHERE l_res.solution_id = res.solution_id);
    `);
    await layoutResultToSolution.down(queryInterface, Sequelize);
    await queryInterface.changeColumn('layout_solution_result', 'basic_result_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    await reactResultToBasic.up(queryInterface, Sequelize);
    await queryInterface.sequelize.query('DROP TYPE enum_layout_solution_result_summary;');
  },

  async down (queryInterface, Sequelize) {
    await reactResultToBasic.down(queryInterface, Sequelize);
    await layoutResultToSolution.up(queryInterface, Sequelize);
    await queryInterface.sequelize.query(`
UPDATE layout_solution_result l_res
SET solution_id = (SELECT id FROM solution_result res WHERE l_res.solution_id = res.solution_id);
    `);
    // TODO: finish the Down
  }
};
