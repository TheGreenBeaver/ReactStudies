'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TemplateConfig extends Model {
    static TEMPLATE_KINDS = {
      auth: 'auth',
      entityList: 'entity_list',
      singleEntity: 'single_entity',
    };

    static associate({ Solution, ReactTask }) {
      this.belongsTo(Solution, {
        foreignKey: { allowNull: true, name: 'solution_id' },
        as: 'solution'
      });
      this.belongsTo(ReactTask, {
        foreignKey: { allowNull: false, name: 'task_id' },
        as: 'task'
      });
    }
  }
  TemplateConfig.init({
    kind: {
      type: DataTypes.ENUM,
      values: Object.values(TemplateConfig.TEMPLATE_KINDS),
      allowNull: false
    },
    endpoints: {
      type: DataTypes.ARRAY(DataTypes.STRING(2000)),
      allowNull: true
    },
    routes: {
      type: DataTypes.ARRAY(DataTypes.STRING(2000)),
      allowNull: true
    },
    special: {
      type: DataTypes.STRING(2000),
      allowNull: true
    }
  }, {
    sequelize,
    timestamps: false,
    tableName: 'template_config',
    modelName: 'TemplateConfig',
  });
  return TemplateConfig;
};
