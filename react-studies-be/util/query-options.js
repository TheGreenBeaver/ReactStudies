const { User, ElementRule, LayoutTask, ReactTask, TaskAttachment, Solution } = require('../models');


const Any_Dummy = { attributes: ['id'] };

const userAuthenticationAttrs = ['id', 'password'];
const userListAttrs = ['id', 'firstName', 'lastName', 'isTeacher'];
const userPublicAttrs = ['email', ...userListAttrs];
const userPrivateAttrs = [...userPublicAttrs, 'isVerified', 'gitHubToken'];
const User_Default = { attributes: userPublicAttrs };
const User_List = { attributes: userListAttrs };
const User_Private = { attributes: userPrivateAttrs };
const User_Authentication = { attributes: userAuthenticationAttrs };

const AuthToken_Authorization = {
  attributes: ['key'],
  include: [{ model: User, as: 'user', ...User_Private }],
};

const LayoutTask_Default = {
  attributes: { exclude: ['id', 'basic_task_id'] },
  include: [{ model: ElementRule, as: 'elementRules' }]
};

const Solution_List = {
  attributes: ['id', 'updatedAt'],
  include: [{ model: User, as: 'student', ...User_List }]
};

const TaskAttachment_Default = {
  attributes: { exclude: ['task_id'] }
};

const Task_Default = {
  attributes: ['id', 'title', 'description', 'repoUrl', 'createdAt', 'updatedAt'],
  include: [
    { model: User, as: 'teacher', ...User_Default },
    { model: LayoutTask, as: 'layoutTask', ...LayoutTask_Default },
    { model: ReactTask, as: 'reactTask' },
    { model: TaskAttachment, as: 'attachments', ...TaskAttachment_Default },
    { model: Solution, as: 'solutions', ...Solution_List }
  ]
};
const Task_List = {
  attributes: ['id', 'title', 'updatedAt'],
  include: [
    { model: ReactTask, as: 'reactTask', ...Any_Dummy },
    { model: LayoutTask, as: 'layoutTask', ...Any_Dummy },
    { model: User, as: 'teacher', ...User_List }
  ]
};

module.exports = {
  Any_Dummy,

  User_Default,
  User_List,
  User_Private,
  User_Authentication,

  AuthToken_Authorization,

  LayoutTask_Default,

  Solution_List,

  TaskAttachment_Default,

  Task_Default,
  Task_List,
};
