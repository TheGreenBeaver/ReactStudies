'use strict';
const { getFkOperations } = require('../util/sql');


const tokenToUser = getFkOperations('auth_token', 'fs_user', {
  key: 'user_id'
});
const ruleToLayoutTask = getFkOperations('element_rule', 'layout_task', {
  key: 'task_id'
});
const layoutTaskToTask = getFkOperations('layout_task', 'task', {
  key: 'basic_task_id'
});
const reactTaskToTask = getFkOperations('react_task', 'task', {
  key: 'basic_task_id'
});
const solutionToUser = getFkOperations('solution', 'fs_user', {
  key: 'student_id'
});
const solutionToTask = getFkOperations('solution', 'task');
const taskToUser = getFkOperations('task', 'fs_user', {
  key: 'teacher_id'
});
const attachmentToTask = getFkOperations('task_attachment', 'task');
const templateConfigToSolution = getFkOperations('template_config', 'solution', {
  allowNull: true
});
const templateConfigToReactTask = getFkOperations('template_config', 'react_task', {
  key: 'task_id'
});

const allOperations = [
  tokenToUser,
  ruleToLayoutTask,
  layoutTaskToTask,
  reactTaskToTask,
  solutionToUser,
  solutionToTask,
  taskToUser,
  attachmentToTask,
  templateConfigToSolution,
  templateConfigToReactTask
];

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
