import path from 'path';
import { cloneDeep } from 'lodash';


function apply(filename, router) {
  const validatorsPath = path.join(__dirname, path.basename(filename));
  const validators = require(validatorsPath);
  validators.forEach(({ path, method, validator }) => {
    router[method](path, async (req, res, next) => {
      try {
        const { body, file, files, user } = req;
        const toValidate = cloneDeep(body);
        if (file) {
          toValidate[file.fieldname] = file;
        }
        if (files) {
          if (Array.isArray(files)) {
            toValidate[files[0].fieldname] = files;
          } else {
            Object.assign(toValidate, files);
          }
        }
        req.body = await validator.validate(toValidate, { abortEarly: false, strict: true }, { context: { user } });
        next('route');
      } catch (e) {
        next(e);
      }
    });
  });
}

module.exports = apply;
