'use strict';
const {
  Model, Op
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReactTask extends Model {
    static associate({ Task, TemplateConfig }) {
      this.belongsTo(Task, {
        foreignKey: { allowNull: false, name: 'basic_task_id' },
        as: 'basicTask'
      });
      this.hasMany(TemplateConfig, {
        scope: {
          solution_id: null
        },
        foreignKey: 'task_id',
        as: 'teacherTemplateConfigs'
      });
      this.hasMany(TemplateConfig, {
        scope: {
          solution_id: { [Op.not]: null }
        },
        foreignKey: 'task_id',
        as: 'studentTemplateConfigs'
      })
    }
  }
  ReactTask.init({
    hasFuzzing: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },

    hasVerification: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },

    hasSearch: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },

    dump: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    dumpIsTemplate: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    dumpUploadUrl: {
      type: DataTypes.STRING(2000),
      allowNull: true
    },
    dumpUploadMethod: {
      type: DataTypes.ENUM,
      values: ['post', 'put', 'patch'],
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'react_task',
    timestamps: false,
    modelName: 'ReactTask',
    hooks: {
      afterUpdate: async instance => {
        const basicTask = await instance.getBasicTask();
        basicTask.updatedAt = new Date();
        await basicTask.save();
      }
    }
  });
  return ReactTask;
};
