const isEmpty = require('lodash/isEmpty')


function serializeTask(task) {
  const serialized = { ...task.dataValues };
  if (isEmpty(serialized.layoutTask)) {
    delete serialized.layoutTask;
  } else {

  }
}
