const { User, Task, AdditionalTaskInfo, TaskAssertion } = require('../models');


const DUMMY = { attributes: ['id'] };

const userBasicAttrs = ['id', 'email', 'firstName', 'lastName'];
const userIdentityAttrs = [...userBasicAttrs, 'isTeacher'];
const userPrivateAttrs = [...userIdentityAttrs, 'isVerified'];
const userAuthenticationAttrs = ['id', 'password'];

const USER_BASIC = {
  attributes: userBasicAttrs
};
const USER_AUTHENTICATION = {
  attributes: userAuthenticationAttrs
};

const TOKEN_AUTHORIZATION = {
  attributes: ['key'],
  include: [{
    model: User,
    as: 'user',
    attributes: userPrivateAttrs
  }]
};

const taskMinAttrs = ['id', 'title'];
const taskBasicAttrs = [...taskMinAttrs, 'sampleImage'];

const TASK_MIN = {
  attributes: taskMinAttrs
};

const TASK_BASIC = {
  attributes: taskBasicAttrs,
  include: [
    {
      model: User,
      as: 'teacher',
      ...USER_BASIC
    },
    {
      model: AdditionalTaskInfo,
      as: 'infoEntries',
      attributes: ['id', 'kind', 'content']
    }
  ]
};
const TASK_FOR_TEACHER = { ...TASK_BASIC };
TASK_FOR_TEACHER.include.push({
  model: TaskAssertion,
  as: 'assertions',
  attributes: ['id', 'kind', 'text']
});

const SOLUTION_BASIC = {
  attributes: ['id', 'path', 'status'],
  include: [
    {
      model: Task,
      as: 'task',
      ...TASK_BASIC
    },
    {
      model: User,
      as: 'student',
      ...USER_BASIC
    }
  ]
};

module.exports = {
  DUMMY,

  USER_BASIC,
  USER_AUTHENTICATION,

  TOKEN_AUTHORIZATION,

  SOLUTION_BASIC,

  TASK_MIN,
  TASK_BASIC,
  TASK_FOR_TEACHER
};