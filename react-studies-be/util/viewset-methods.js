const { isAsync, asyncMap } = require('./misc');

async function retrieve(req, res, next, { Model, options, serializer = v => v }) {
  try {
    const instance = await Model.findByPk(+req.params.id, { rejectOnEmpty: true, ...options });
    const serialized = isAsync(serializer) ? await serializer(instance) : serializer(instance);
    return res.json(serialized);
  } catch (e) {
    next(e);
  }
}

async function list(req, res, next, { Model, options, serializer = v => v }) {
  try {
    const instances = await Model.findAll(options);
    const serialized = isAsync(serializer)
      ? instances.map(serializer)
      : await asyncMap(instances, serializer);
    return res.json(serialized);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  retrieve, list
};