'use strict';
const { underscores } = require('../util/sql');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('react_task', underscores({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      hasFuzzing: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      hasAuthTemplate: {
        allowNull: false,
        defaultValue: true,
        type: Sequelize.BOOLEAN,
      },
      hasVerification: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },

      hasEntityListTemplate: {
        allowNull: false,
        defaultValue: true,
        type: Sequelize.BOOLEAN,
      },
      hasSearch: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },

      hasSingleEntityTemplate: {
        allowNull: false,
        defaultValue: true,
        type: Sequelize.BOOLEAN,
      },

      dump: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      dumpIsTemplate: {
        allowNull: false,
        defaultValue: true,
        type: Sequelize.BOOLEAN,
      },
      dumpUploadUrl: {
        type: Sequelize.STRING(2000),
        allowNull: true
      },
      dumpUploadMethod: {
        type: Sequelize.ENUM,
        values: ['post', 'put', 'patch'],
        allowNull: true
      }
    }));
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('react_task');
  }
};
