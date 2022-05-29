'use strict';

const { getFkOperations } = require('../util/sql');


const taskToTeacher = getFkOperations('task', 'fs_user', {
  key: 'teacher_id'
});
const solutionToStudent = getFkOperations('solution', 'fs_user', {
  key: 'student_id'
});
const authTokenToUser = getFkOperations('auth_token', 'fs_user', {
  key: 'user_id'
});
const solutionToTask = getFkOperations('solution', 'task');

const allOperations = [taskToTeacher, solutionToStudent, authTokenToUser, solutionToTask];

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
