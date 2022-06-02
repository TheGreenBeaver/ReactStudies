'use strict';
const { getFkOperations, getUniqueOperations } = require('../util/sql');

const pageToReactTask = getFkOperations('react_task_page', 'react_task', {
  key: 'task_id'
});
const pageToSolution = getFkOperations('react_task_page', 'solution', {
  allowNull: true
});
const uniqueTemplates = getUniqueOperations('react_task_page', ['task_id', 'template']);

const allOperations = [pageToReactTask, pageToSolution, uniqueTemplates];

module.exports = {
  async up (...args) {
    for (const op of allOperations) {
      await op.up(...args);
    }
  },

  async down (...args) {
    for (const op of allOperations) {
      await op.down(...args);
    }
  }
};
