const {
  User,
  ElementRule,
  LayoutTask,
  ReactTask,
  TaskAttachment,
  Solution,
  SolutionResult,
  LayoutSolutionResult,
  ReactSolutionResult,
  Task,
  TemplateConfig
} = require('../models');
const omit = require('lodash/omit');


const Any_Dummy = { attributes: ['id'] };

const userAuthenticationAttrs = ['id', 'password'];
const userListAttrs = ['id', 'firstName', 'lastName', 'isTeacher', 'email'];
const userPrivateAttrs = [...userListAttrs, 'isVerified', 'gitHubToken', 'newPassword'];
const User_List = { attributes: userListAttrs };

const Solution_UnprocessedResults = {
  ...Any_Dummy,
  order: [[SolutionResult, 'createdAt', 'DESC']],
  include: [{
    where: { isProcessed: false },
    model: SolutionResult,
    as: 'results',
    ...Any_Dummy,
    required: true,
  }]
};

const User_Private = {
  attributes: userPrivateAttrs,
  include: [{
    model: Solution,
    as: 'solutions',
    ...Solution_UnprocessedResults
  }]
};
const User_Authentication = { attributes: userAuthenticationAttrs };

const AuthToken_Authorization = {
  attributes: ['key'],
  include: [{ model: User, as: 'user', ...User_Private }],
};

const ElementRule_Default = {
  attributes: { exclude: ['task_id'] }
};

const ReactTask_Default = {
  attributes: { exclude: ['id', 'basic_task_id'] },
  include: [{ model: TemplateConfig, as: 'teacherTemplateConfigs', attributes: { exclude: ['solution_id'] } }]
};

const LayoutTask_Default = {
  attributes: { exclude: ['id', 'basic_task_id'] },
  include: [{ model: ElementRule, as: 'elementRules', ...ElementRule_Default }]
};

const Task_List = {
  attributes: ['id', 'title', 'updatedAt'],
  include: [
    { model: ReactTask, as: 'reactTask', ...Any_Dummy },
    { model: LayoutTask, as: 'layoutTask', ...Any_Dummy },
    { model: User, as: 'teacher', ...User_List }
  ],
  order: [['updatedAt', 'DESC']]
};

const SolutionResult_List = {
  attributes: ['id', 'summary', 'isProcessed', 'runId', 'createdAt'],
  include: [
    { model: LayoutSolutionResult, as: 'layoutResult', ...Any_Dummy },
    { model: ReactSolutionResult, as: 'reactResult', ...Any_Dummy },
    { model: Solution, as: 'solution', ...Any_Dummy }
  ],
  order: [['createdAt', 'DESC']]
};
const SolutionResult_Default = {
  attributes: ['id', 'summary', 'isProcessed', 'runId', 'createdAt'],
  include: [
    { model: LayoutSolutionResult, as: 'layoutResult' },
    { model: ReactSolutionResult, as: 'reactResult' }
  ],
};

const Solution_List = {
  attributes: ['id', 'updatedAt'],
  order: [['updatedAt', 'DESC']],
  include: [{
    model: SolutionResult,
    as: 'results',
    order: [['createdAt', 'DESC']],
    attributes: ['summary', 'createdAt', 'isProcessed'],
    required: false,
    limit: 1
  }, {
    model: User, as: 'student', ...User_List
  }, {
    model: Task, as: 'task', ...omit(Task_List, 'order')
  }]
};
const Solution_Default = {
  attributes: ['id', 'repoUrl', 'updatedAt'],
  include: [
    { model: User, as: 'student', ...User_List },
    { model: Task, as: 'task', ...omit(Task_List, 'order') }
  ]
};

const TaskAttachment_Default = {
  attributes: { exclude: ['task_id'] }
};

const Task_Default = {
  attributes: ['id', 'title', 'description', 'repoUrl', 'createdAt', 'updatedAt'],
  include: [
    { model: User, as: 'teacher', ...User_List },
    { model: LayoutTask, as: 'layoutTask', ...LayoutTask_Default },
    { model: ReactTask, as: 'reactTask', ...ReactTask_Default },
    { model: TaskAttachment, as: 'attachments', ...TaskAttachment_Default },
  ]
};

module.exports = {
  Any_Dummy,

  User_List,
  User_Private,
  User_Authentication,

  AuthToken_Authorization,

  LayoutTask_Default,

  Solution_List,
  Solution_Default,

  TaskAttachment_Default,

  Task_Default,
  Task_List,

  SolutionResult_List,
  SolutionResult_Default
};
