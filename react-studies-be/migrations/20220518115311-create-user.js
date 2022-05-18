'use strict';
const { underscores } = require('../util/sql');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rs_user', underscores({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      firstName: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      isTeacher: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      newPassword: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }));
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
