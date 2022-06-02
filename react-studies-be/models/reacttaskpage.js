'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReactTaskPage extends Model {
    static PAGE_TEMPLATES = {
      signUp: 'sign_up',
      signIn: 'sign_in',
      entityList: 'entity_list',
      singleEntity: 'single_entity'
    };

    static associate({ ReactTask, Solution }) {
      this.belongsTo(ReactTask, {
        foreignKey: { allowNull: false, name: 'task_id' },
        as: 'task'
      });
      this.belongsTo(Solution, {
        foreignKey: { allowNull: true, name: 'solution_id' },
        as: 'solution'
      });
    }
  }
  ReactTaskPage.init({
    dump: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dumpIsFile: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    dumpIsTemplate: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    endpoints: {
      type: DataTypes.ARRAY(DataTypes.STRING(2000)),
      allowNull: true
    },
    template: {
      type: DataTypes.ENUM,
      values: Object.values(ReactTaskPage.PAGE_TEMPLATES),
      allowNull: false
    },
    route: {
      type: DataTypes.STRING(2000),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'react_task_page',
    modelName: 'ReactTaskPage',
    timestamps: false
  });
  return ReactTaskPage;
};
