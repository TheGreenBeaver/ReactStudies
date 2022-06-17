const snakeCase = require('lodash/snakeCase');
const { DEFAULT_PAGE_SIZE } = require('../settings');
const httpStatus = require('http-status');
const { StatusError } = require('./custom-errors');


/**
 *
 * @param {string} table - name of the table that Belongs To
 * @param {string} referencedTable - name if the table that Has Many
 * @param {string} [referencedField = 'id'] - field of the `referencedTable` to connect through
 * @param {string=} key - the name of the column to be added to `table`
 * @param {string=} constraintName - the name of the constraint to be created
 * @param {boolean} [allowNull = false]
 * @return {{up: ((function(*, *): Promise<void>)), down: ((function(*, *): Promise<void>))}}
 */
function getFkOperations(table, referencedTable, {
  referencedField = 'id',
  key = `${referencedTable}_${referencedField}`,
  constraintName = `${table}_${referencedTable}_${referencedField}_fkey`,
  allowNull = false
} = {}) {

  return {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn(table, key, {
        type: Sequelize.INTEGER,
        allowNull
      });
      await queryInterface.addConstraint(table, {
        fields: [key],
        type: 'foreign key',
        name: constraintName,
        references: {
          table: referencedTable,
          field: referencedField
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    },
    down: async (queryInterface, Sequelize) => {
      await queryInterface.removeConstraint(table, constraintName);
      await queryInterface.removeColumn(table, key);
    }
  };
}

function getUniqueOperations(tableName, fields, name = `${tableName}_${fields.join('_')}_unique`) {
  return {
    up: async (queryInterface) => queryInterface.addConstraint(tableName, {
      type: 'unique', fields, name
    }),

    down: async (queryInterface) => queryInterface.removeConstraint(tableName, name)
  };
}

function underscores(attrs) {
  return Object.entries(attrs).reduce((res, [attrName, attrConfig]) => ({
    ...res,
    [attrName]: { ...attrConfig, field: snakeCase(attrName) }
  }), {});
}

async function paginate(
  scope,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  options = {},
  searchFor
) {
  const allResults = searchFor
    ? await scope[`get${searchFor}`](options)
    : await scope.findAll(options);
  const count = allResults.length;
  if ((page - 1) * pageSize >= count && count > 0) {
    throw new StatusError(httpStatus.BAD_REQUEST);
  }
  const results = allResults.slice((page - 1) * pageSize, page * pageSize);
  return {
    data: {
      results, count,
      next: page * pageSize < count ? page + 1 : null, prev: (page - 1) || null,
    }
  };
}

function getUpdateReflectorHook(instanceName) {
  return async instance => {
    const basicInstance = await instance[`getBasic${instanceName}`]();
    basicInstance.updatedAt = new Date();
    await basicInstance.save();
  }
}

module.exports = {
  getFkOperations, underscores, getUniqueOperations, paginate, getUpdateReflectorHook
};
