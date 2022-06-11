const startCase = require('lodash/startCase');
const isEqual = require('lodash/isEqual');
const { setLocale, array, string, object, mixed, number, ArraySchema, addMethod, BaseSchema, StringSchema, ObjectSchema } = require('yup');
const mapValues = require('lodash/mapValues');
const isEmpty = require('lodash/isEmpty');
const uniq = require('lodash/uniq');
const { Task } = require('../models');


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

addMethod(BaseSchema, 'uniqList', function uniqList(entryTitle, comparator = isEqual) {
  return array().of(this.test(
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
});

addMethod(BaseSchema, 'canSkip', function canSkip() {
  return this.nullable().optional();
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
      content: string().required('Text blocks must not be empty').uniqList('Text block')
    };
    Object.keys(singleElementSpec).forEach(field => {
      singleElementSpec[field] = requiredElementFields.includes(field)
        ? this.#requiredSchema(singleElementSpec[field], true)
        : singleElementSpec[field].canSkip();
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
      maxUsage: this.numeric(min, max, true).label('Threshold').canSkip(),
      allowedFor: this.#requiredSchema(this.elementList().label('rule')).canSkip()
    }).noUnknown().canSkip();
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

  static urlPathname() {
    return string()
      .max(2000, 'Path must not exceed 2000 characters')
      .test('urlPathname', 'Not a valid path', (value, { createError }) => {
        if (!value) {
          return true;
        }
        if (!/^\/.*/.test(value)) {
          return createError({ message: 'Path must start with /' });
        }
        try {
          new URL(value, 'http://localhost');
          return true;
        } catch {
          return false;
        }
      });
  }

  static #isBool(v) {
    return typeof v === 'boolean';
  }

  static #allowedTokensForTypes = {
    string: ['max', 'min', 'nullable', 'email', 'unique'],
    number: ['max', 'min', 'nullable', 'int'],
    date: ['format', 'nullable', 'allowPast', 'allowFuture'],
    bool: ['nullable'],
    array: ['max', 'min', 'of', 'nullable'],
    enum: ['values', 'nullable']
  };
  static #validationsForTokens = {
    max: Number.isInteger,
    min: Number.isInteger,
    nullable: this.#isBool,
    email: this.#isBool,
    int: this.#isBool,
    format: v => typeof v === 'string',
    allowPast: this.#isBool,
    allowFuture: this.#isBool,
    of: v => typeof v === 'object',
    values: v => Array.isArray(v) && uniq(v).length === v.length,
    unique: this.#isBool
  };

  static #unpackTemplateConfig(config) {
    if (typeof config !== 'object') {
      return 'Config must be an object';
    }
    const { type, ...rest } = config;
    if (typeof type === 'object') {
      return this.unpackTemplateDump(type);
    }
    if (!(type in this.#allowedTokensForTypes)) {
      return `"${type}" is not a valid type definition`;
    }
    const allowedTokens = this.#allowedTokensForTypes[type];
    for (const [tokenName, tokenDef] of Object.entries(rest)) {
      if (!allowedTokens.includes(tokenName)) {
        return `"${tokenName}" is not a valid token for type "${type}"`;
      }
      if (!this.#validationsForTokens[tokenName](tokenDef)) {
        return `"${tokenDef}" is not a valid definition for token "${tokenName}"`;
      }
      if (['max', 'min'].includes(tokenName) && type !== 'number' && tokenDef < 0) {
        return `Token "${tokenName}" for type "${type}" must have non-negative value (got ${tokenDef})`;
      }
      if (rest.email) {
        if (tokenName === 'max') {
          return '"max" for emails is always 100';
        }
        if (tokenName === 'min') {
          return '"min" for emails is always 15';
        }
      }
      if (tokenName === 'of') {
        return this.#unpackTemplateConfig(tokenDef);
      }
    }

    if (type === 'enum' && !rest.values) {
      return '"values" token is required for type "enum"';
    }

    return null;
  }

  static unpackTemplateDump(dump) {
    for (const config of Object.values(dump)) {
      const configUnpackResult = this.#unpackTemplateConfig(config);
      if (configUnpackResult) {
        return configUnpackResult;
      }
    }

    return null;
  }
}

addMethod(BaseSchema, 'onlyKind', function onlyKind(kind) {
  return this.when('$body', {
    is: body => body.kind === kind,
    then: schema => schema,
    otherwise: () => Validators.ensureEmpty()
  });
});

addMethod(ObjectSchema, 'withPagination', function withPagination() {
  return this.shape({
    page: Validators.niceNumber().optional(),
    pageSize: Validators.niceNumber().optional()
  }).noUnknown();
});

addMethod(StringSchema, 'dump', function dump() {
  return this.test('isDump', 'Validation error', (value, testContext) => {
    if (!value) {
      return true;
    }
    const { parent: { dumpIsTemplate }, createError } = testContext;
    try {
      const asJson = JSON.parse(value);
      if (dumpIsTemplate) {
        const message = Validators.unpackTemplateDump(asJson);
        if (message) {
          return createError({ message });
        }
      }
      return true;
    } catch {
      return createError({ message: 'Not a valid JSON' });
    }
  });
});

addMethod(ObjectSchema, 'templateConfig', function templateConfig() {
  return this.shape({
    endpoints: array().of(Validators.urlPathname()).canSkip(),
    routes: array().of(Validators.urlPathname()).canSkip(),
    special: Validators.urlPathname().canSkip()
  }).noUnknown().canSkip().onlyKind(Task.TASK_KINDS.react);
});

module.exports = Validators;
