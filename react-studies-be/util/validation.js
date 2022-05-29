const startCase = require('lodash/startCase');
const isEqual = require('lodash/isEqual');
const { setLocale, array, string, object, mixed, number, ArraySchema } = require('yup');
const mapValues = require('lodash/mapValues');
const isEmpty = require('lodash/isEmpty');


setLocale({
  mixed: {
    required: ({ path }) => `${startCase(path)} is required`
  },
  string: {
    email: 'Not a valid email address',
    max: ({ path, max }) => `${startCase(path)} must not exceed ${max} characters`
  },
  array: {
    min: ({ path, min }) => `At least ${min} ${startCase(path)}${min === 1 ? '' : 's'} must be provided`
  }
});

class Validators {
  static #getAcceptPattern(acceptToken) {
    return new RegExp(acceptToken.replace(/\*/g, '[a-zA-Z-]+'));
  }

  static #mimeFits(mime, accept) {
    return accept.split(',').some(token => this.#getAcceptPattern(token).test(mime));
  }

  static #requiredSchema(schema, ultra) {
    return schema instanceof ArraySchema
      ? schema.min(1)[ultra ? 'required' : 'optional']()
      : schema.required();
  }

  static strictObject(spec) {
    return object(mapValues(spec, f => f.required())).noUnknown();
  }

  static enumOf(options, message) {
    return mixed().oneOf(Array.isArray(options) ? options : Object.values(options), message);
  }

  static ensureEmpty() {
    return mixed().test({
      name: 'isEmpty',
      message: '${path} must be empty',
      test: value => isEmpty(value)
    });
  }

  static niceNumber() {
    return number().positive().integer();
  }

  static entityId() {
    return this.niceNumber().min(1);
  }

  static uniqList(entrySchema, entryTitle, comparator = isEqual) {
    return array().of(entrySchema.test(
      'uniqEntries',
      `${entryTitle}s must be unique`,
      (value, { options, parent }) => {
        if (!value) {
          return true;
        }
        const ownIdx = options.index;
        return !parent.some((entry, idx) => comparator(entry, value) && idx !== ownIdx);
      })
    );
  }

  static standardText(max) {
    return string().max(max).required();
  }

  static SIZE_UNITS = { B: 'B', KB: 'KB', MB: 'MB', GB: 'GB', TB: 'TB' };

  static #unitsPower = Object.values(this.SIZE_UNITS);
  static #bytesPerPower = 1024;

  static #humanizeFileSize(sizeInBytes) {
    let unitIdx = 0;
    let val = sizeInBytes;
    while (val >= this.#bytesPerPower && unitIdx < this.#unitsPower.length) {
      val /= this.#bytesPerPower;
      unitIdx++;
    }
    return `${val.toFixed(2)} ${this.#unitsPower[unitIdx]}`;
  }

  static #serializeFileSize(sizeInUnits, unit) {
    const power = this.#unitsPower.indexOf(unit);
    return sizeInUnits * Math.pow(this.#bytesPerPower, power);
  }

  static file(accept, maxSize, multiple) {
    const humanizedMaxSize = Array.isArray(maxSize) ? maxSize.join(' ') : this.#humanizeFileSize(maxSize);
    const serializedFileSize = Array.isArray(maxSize) ? this.#serializeFileSize(...maxSize) : maxSize;

    const baseSchema = array().of(this.strictObject({
      fieldname: string(),
      originalname: string(),
      encoding: string(),
      mimetype: string().test(
        'mimeFits', 'File type is not supported', value => this.#mimeFits(value, accept)
      ),
      size: this.niceNumber().max(serializedFileSize, `File size must not exceed ${humanizedMaxSize}`),
      destination: string(),
      filename: string(),
      path: string()
    }));
    return multiple ? baseSchema : baseSchema.length(1, 'Must be a single file');
  }

  static elementList(requiredElementFields = []) {
    const singleElementSpec = {
      tag: string().max(20),
      content: this.uniqList(
        string().required('Text blocks must not be empty'), 'Text block'
      )
    };
    Object.keys(singleElementSpec).forEach(field => {
      singleElementSpec[field] = requiredElementFields.includes(field)
        ? this.#requiredSchema(singleElementSpec[field], true)
        : singleElementSpec[field].optional();
    });
    return array().of(
      object(singleElementSpec).test(
        'oneConstraint', 'At least one constraint must be specified',
        value => Object.values(value).some(Boolean),
      )
    );
  }

  static numeric(min, max, nullable) {
    return mixed().test('numeric', 'Validation error', (value, { createError }) => {
      if (value == null) {
        return nullable || createError({ message: '${path} must not be empty' })
      }
      if (value === '') {
        return createError({ message: '${path} must not be empty' });
      }
      if (isNaN(value)) {
        return createError({ message: '${path} must be a number' })
      }
      if (value > max || value < min) {
        return createError({ message: `\${path} must be a value between ${min} and ${max}` });
      }
      return true;
    });
  }

  static caveat(min = 1, max = 99) {
    return object({
      maxUsage: this.numeric(min, max, true).label('Threshold').optional(),
      allowedFor: this.#requiredSchema(this.elementList().label('rule')).nullable()
    }).nullable().optional();
  }

  static gitHubToken() {
    return mixed()
      .test('token', 'Validation error', (value, context) => {
        const token = value || context.options.context.user.gitHubToken;
        if (!token) {
          return context.createError({ message: 'No token found' });
        }
        return /^ghp_\w{36}$/.test(token) ? true : context.createError({ message: 'Not a valid Personal Access Token' });
      });
  }

  static onlyKind(kind, schema) {
    return schema.when('kind', {
      is: kind,
      then: schema => schema,
      otherwise: () => this.ensureEmpty()
    });
  }
}


module.exports = Validators;
