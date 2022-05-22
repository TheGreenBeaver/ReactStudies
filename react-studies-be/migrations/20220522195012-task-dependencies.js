'use strict';

const { getFkOperations } = require('../util/sql');


const elementRuleToLayoutTask = getFkOperations('element_rule', 'layout_task', {
  key: 'task_id'
});
const layoutTaskToBasicTask = getFkOperations('layout_task', 'task', {
  key: 'basic_task_id'
});
const reactTaskToBasicTask = getFkOperations('react_task', 'task', {
  key: 'basic_task_id'
});
const taskAttachmentToTask = getFkOperations('task_attachment', 'task')
const allOperations = [elementRuleToLayoutTask, layoutTaskToBasicTask, reactTaskToBasicTask, taskAttachmentToTask];

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
  },
};
