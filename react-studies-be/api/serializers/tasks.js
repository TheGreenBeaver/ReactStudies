const isEmpty = require('lodash/isEmpty')
const cloneDeep = require('lodash/cloneDeep');
const { Task } = require('../../models');
const { composeMediaPath } = require('../../util/misc');


module.exports = {
  list: task => {
    const serialized = cloneDeep(task.dataValues);

    Object.values(Task.TASK_KINDS).forEach(kind => {
      if (!isEmpty(serialized[`${kind}Task`])) {
        serialized.kind = kind;
      }
      delete serialized[`${kind}Task`];
    });

    return serialized;
  },
  create: task => ({ id: task.id }),
  retrieve: task => {
    const serialized = cloneDeep(task.dataValues);

    serialized.attachments = serialized.attachments.map(fileData => ({
      ...fileData.dataValues, location: composeMediaPath(fileData.location)
    }));

    if (!isEmpty(serialized.layoutTask)) {
      serialized.layoutTask.sampleImage = composeMediaPath(serialized.layoutTask.sampleImage);
      serialized.solutions = serialized.solutions.map(solution => ({
        ...solution.dataValues,
        result: solution.layoutResults?.[0]
      }));
    } else {
      delete serialized.layoutTask;
    }

    if (!isEmpty(serialized.reactTask)) {
      serialized.solutions = serialized.solutions.map(solution => ({
        ...solution.dataValues,
        result: solution.reactResults?.[0]
      }));
    } else {
      delete serialized.reactTask;
    }

    return serialized;
  }
}
