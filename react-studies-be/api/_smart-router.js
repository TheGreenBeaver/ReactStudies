const express = require('express');
const accessMw = require('../middleware/access');
const multerMw = require('../middleware/multer');
const httpStatus = require('http-status');
const path = require('path');
const { ROOT_DIR } = require('../settings');
const { isAsync, asyncMap } = require('../util/misc');
const { paginate } = require('../util/sql');


class SmartRouter {
  static HttpMethods = {
    get: 'get',
    post: 'post',
    patch: 'patch',
    delete: 'delete',
  };

  /**
   * @type {typeof Model}
   */
  Model
  filename = __filename;
  DefaultAccessRules = {};
  AccessRules = {};
  MulterLogic = {};
  paginate = true;
  router = express.Router();

  constructor(Model, filename, {
    AccessRules = {},
    DefaultAccessRules = {},
    MulterLogic = {},
    paginate = true
  } = {}) {
    this.Model = Model;
    this.filename = filename;
    this.AccessRules = AccessRules;
    this.DefaultAccessRules = DefaultAccessRules;
    this.MulterLogic = MulterLogic;
    this.paginate = paginate;

    this.retrieve = this.apiDecorator(
      this.handleRetrieve.bind(this), SmartRouter.HttpMethods.get, '/:id(\\d+)', 'retrieve'
    );
    this.list = this.apiDecorator(
      this.handleList.bind(this), SmartRouter.HttpMethods.get, '/', 'list'
    );
    this.create = this.apiDecorator(
      this.handleCreate.bind(this), SmartRouter.HttpMethods.post, '/', 'create'
    );
    this.update = this.apiDecorator(
      this.handleUpdate.bind(this), SmartRouter.HttpMethods.patch, '/:id(\\d+)', 'update'
    );
    this.remove = this.apiDecorator(
      this.handleRemove.bind(this), SmartRouter.HttpMethods.delete, '/:id(\\d+)', 'remove'
    );
  }

  get routerName() {
    return path.basename(this.filename);
  }

  getSettings(type, handlerName) {
    try {
      const block = require(path.join(ROOT_DIR, 'api', type, this.routerName));
      return block?.[handlerName];
    } catch {}
  }

  getAccessRules(handlerName) {
    return this.AccessRules[handlerName] || this.DefaultAccessRules;
  }

  getPreprocessors(handlerName) {
    const preprocessors = [];
    const multerParams = this.MulterLogic[handlerName];
    if (multerParams) {
      preprocessors.push(multerMw(...multerParams));
    }
    const transformer = this.getSettings('transformers', handlerName);
    if (transformer) {
      preprocessors.push(async (req, res, next) => {
        await transformer(req);
        next();
      });
    }
    return preprocessors;
  }

  getValidators(handlerName) {
    const schemas = this.getSettings('validators', handlerName);
    if (!schemas) {
      return [];
    }
    return Object.entries(schemas).map(([validatedField, schema]) => async (req, res, next) => {
      try {
        await schema.validate(req[validatedField], { abortEarly: false, strict: true, context: req });
        next();
      } catch (e) {
        next(e);
      }
    });
  }

  getSerializer(handlerName) {
    return this.getSettings('serializers', handlerName) || (v => v);
  }

  /**
   *
   * @param {string} handlerName
   * @param {express.Request} req
   * @return {Object}
   */
  getQueryOptions(handlerName, req) {
    return this.getSettings('query-options', handlerName) || {};
  }

  /**
   * @typedef {Object} HandlerResult
   * @property {any=} data
   * @property {number=} status
   * @property {boolean=} __paginated
   */
  /**
   *
   * @param {function(
   *  req: express.Request,
   *  options: Object,
   *  res: express.Response, next: NextFunction
   * ): Promise<HandlerResult> | HandlerResult} handler
   * @param {string} method
   * @param {string} path
   * @param {string} name
   */
  apiDecorator(handler, method, path, name) {
    const stack = [];

    const accessRules = this.getAccessRules(name);
    Object.entries(accessMw)
      .sort(([, { order: orderA }], [, { order: orderB }]) => orderA - orderB)
      .forEach(([ruleName, { provider }]) => {
        if (ruleName in accessRules) {
          stack.push(provider(accessRules[ruleName]))
        }
      });

    stack.push(...this.getPreprocessors(name));
    stack.push(...this.getValidators(name));

    stack.push(async (req, res, next) => {
      try {
        const options = this.getQueryOptions(name, req);
        const { status, data, __paginated } = await handler(req, options, res, next);
        const theStatus = status || httpStatus.OK
        if (!data) {
          return res.status(theStatus).end();
        }
        const serializer = this.getSerializer(name);
        let toSend;
        if (__paginated) {
          toSend = {
            ...data,
            results: isAsync(serializer) ? data.results.map(serializer) : await asyncMap(data.results, serializer)
          };
        } else if (Array.isArray(data)) {
          toSend = isAsync(serializer)
            ? data.map(serializer)
            : await asyncMap(data, serializer);
        } else {
          toSend = isAsync(serializer) ? await serializer(data) : serializer(data);
        }
        return res.status(theStatus).json(toSend);
      } catch (e) {
        next(e);
      }
    });

    this.router[method](path, ...stack);

    return name;
  }

  /**
   *
   * @param {express.Request} req
   * @param {Object} options
   * @param {express.Response} res
   * @param {NextFunction} next
   * @return {Promise<{ data: any, status?: number }> | { data: any, status?: number }}
   */
  async handleRetrieve(req, options, res, next) {
    const data = await this.Model.findByPk(+req.params.id, { rejectOnEmpty: true, ...options });
    return { data };
  }

  /**
   *
   * @param {express.Request} req
   * @param {Object} options
   * @param {express.Response} res
   * @param {NextFunction} next
   * @return {Promise<{ data: any, status?: number }> | { data: any, status?: number }}
   */
  async handleList(req, options, res, next) {
    if (this.paginate) {
      return paginate(this.Model, req.query.page, req.query.pageSize, options);
    }
    const data = await this.Model.findAll(options);
    return { data };
  }

  /**
   *
   * @param {express.Request} req
   * @param {Object} options
   * @param {express.Response} res
   * @param {NextFunction} next
   * @return {Promise<{ data: any, status?: number }> | { data: any, status?: number }}
   */
  async handleCreate(req, options, res, next) {
    const data = await this.Model.create(req.body, options);
    return { data, status: httpStatus.CREATED };
  }

  /**
   *
   * @param {express.Request} req
   * @param {Object} options
   * @param {express.Response} res
   * @param {NextFunction} next
   * @return {Promise<{ data: any, status?: number }> | { data: any, status?: number }}
   */
  async handleUpdate(req, options, res, next) {
    const instance = await this.Model.findByPk(+req.params.id, { rejectOnEmpty: true });
    await instance.update(req.body, options);
    return { data: instance };
  }

  /**
   *
   * @param {express.Request} req
   * @param {Object} options
   * @param {express.Response} res
   * @param {NextFunction} next
   * @return {Promise<{ data: any, status?: number }> | { data: any, status?: number }}
   */
  async handleRemove(req, options, res, next) {
    const instance = await this.Model.findByPk(+req.params.id, { rejectOnEmpty: true });
    await instance.destroy();
    return { status: httpStatus.NO_CONTENT };
  }
}

module.exports = SmartRouter;
