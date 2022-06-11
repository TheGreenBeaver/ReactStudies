'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    for (const col of ['has_auth_template', 'has_single_entity_template', 'has_entity_list_template']) {
      await queryInterface.removeColumn('react_task', col);
    }
  },

  async down (queryInterface, Sequelize) {
    // TODO: Down
  }
};
