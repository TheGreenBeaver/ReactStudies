'use strict';
const { getFkOperations } = require('../util/sql');


const layoutResultToSolution = getFkOperations('layout_solution_result', 'solution');

module.exports = {
  async up (...args) {
    await layoutResultToSolution.up(...args);
  },

  async down (...args) {
    await layoutResultToSolution.down(...args);
  },
};
