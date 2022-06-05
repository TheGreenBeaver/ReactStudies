'use strict';
const { underscores } = require('../util/sql');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('solution', underscores({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      repoUrl: {
        type: Sequelize.STRING(2000),
        allowNull: false
      },
      dumpUploadUrl: {
        type: Sequelize.STRING(2000),
        allowNull: true
      },
      dumpUploadMethod: {
        type: Sequelize.ENUM,
        values: ['post', 'put', 'patch'],
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }));
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('solution');
  }
};
