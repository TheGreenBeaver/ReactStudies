const { paginationTransformer } = require('../../util/transformers');
const { Task } = require('../../models');
const { Task_Default } = require('../../util/query-options');


module.exports = {
  list: req => {
    paginationTransformer(req);
    if ('taskId' in req.query) {
      req.query.taskId = parseInt(req.query.taskId);
    }
  },
  create: async req => {
    const { taskId } = req.body;
    if (typeof taskId === 'number') {
      req.body.task = await Task.findByPk(taskId, { ...Task_Default, rejectOnEmpty: false});
    }
    delete req.body.taskId;
  }
};
