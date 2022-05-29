'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('task', 'description', {
      type: Sequelize.TEXT, allowNull: true
    });
    await queryInterface.addColumn('task', 'track_updates', {
      allowNull: false, type: Sequelize.BOOLEAN, defaultValue: false
    });
    await queryInterface.addColumn('task_attachment', 'mime', {
      allowNull: false, type: Sequelize.STRING(50)
    });
    await queryInterface.changeColumn('element_rule', 'tag', {
      type: Sequelize.STRING(20), allowNull: true
    });
    await queryInterface.sequelize.query(
      'ALTER TABLE element_rule ALTER content type text[] USING array[content]'
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('task', 'description', {
      type: Sequelize.STRING(1500), allowNull: true
    });
    await queryInterface.removeColumn('task', 'track_updates');
    await queryInterface.removeColumn('task_attachment', 'mime');
    await queryInterface.changeColumn('element_rule', 'tag', {
      type: Sequelize.STRING, allowNull: true
    });
    await queryInterface.sequelize.query(
      'ALTER TABLE element_rule ALTER content type text USING content[0]'
    );
  }
};
