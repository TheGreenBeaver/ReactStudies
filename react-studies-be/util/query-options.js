const { User, ElementRule, LayoutTask, ReactTask, TaskAttachment, Solution } = require('../models');


const dummyAttrs = ['id'];
const Dummy = { attributes: dummyAttrs };

const userAuthenticationAttrs = ['id', 'password'];
const userListAttrs = ['firstName', 'lastName', 'isTeacher'];
const userPublicAttrs = ['id', 'email', ...userListAttrs];
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
  attributes: ['sampleImage', 'absPosMaxUsage', 'rawSizingMaxUsage'],
  include: [{ model: ElementRule, as: 'elementRules' }]
};
const LayoutTask_Hidden = { attributes: ['sampleImage'] };

const Solution_List = {
  attributes: ['id', 'updatedAt'],
  include: [{ model: User, as: 'student', ...User_List }]
};

const taskDefaultInclude = [
  { model: User, as: 'teacher', ...User_Default },
  { model: LayoutTask, as: 'layoutTask', ...LayoutTask_Default },
  { model: ReactTask, as: 'reactTask' },
  { model: TaskAttachment, as: 'attachments' }
];
const taskDefaultAttrs = ['id', 'title', 'description', 'repoUrl', 'trackUpdates', 'createdAt', 'updatedAt'];
const Task_Default = { attributes: taskDefaultAttrs, include: taskDefaultInclude };
const Task_List = {
  attributes: ['id', 'title'],
  include: [
    { model: ReactTask, as: 'reactTask', attributes: dummyAttrs },
    { model: LayoutTask, as: 'layoutTask', attributes: dummyAttrs },
    { model: User, as: 'teacher', ...User_List }
  ]
};
const Task_ForTeacher = {
  attributes: taskDefaultAttrs, include: [
    ...taskDefaultInclude,
    { model: Solution, as: 'solutions', ...Solution_List }
  ],
};

module.exports = {
  Dummy,

  User_Default,
  User_List,
  User_Private,
  User_Authentication,

  AuthToken_Authorization,

  LayoutTask_Default,
  LayoutTask_Hidden,

  Solution_List,

  Task_Default,
  Task_List,
  Task_ForTeacher
};
