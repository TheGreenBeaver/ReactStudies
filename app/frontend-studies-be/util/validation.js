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

addMethod(ObjectSchema, 'someField', function someConstraint(label = 'constraint') {
  return this.test(
    'someField',
    `At least one ${label} must be specified`,
      value => Object.values(value).some(field => !isEmpty(field))
  );
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
    return array().of(object(singleElementSpec).someField());
  }

  static numeric(min, max, nullable) {
    return mixed().test('numeric', 'Validation error', (value, { createError }) => {
      if (value == null) {
        return !!nullable || createError({ message: '${path} must not be empty' })
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
    }).noUnknown().optional();
  }

  static gitHubToken() {
    return mixed()
      .test('token', 'Not a valid Personal Access Token', (value, context) => {
        const token = value || context.options.context.user.gitHubToken;
        return token ? /^ghp_\w{36}$/.test(token) : context.createError({ message: 'No token found' });
      });
  }

  static #isBool(v) {
    return typeof v === 'boolean';
  }

  static #isNum(v) {
    return typeof v === 'number';
  }

  static #isObj(v) {
    return v?.constructor?.name === 'Object';
  }

  static #isUniqArray(v) {
    return Array.isArray(v) && uniq(v).length === v.length;
  }

  static #allowedTokensForTypes = {
    string: ['max', 'min', 'nullable', 'email', 'unique', 'letterSets', 'allowCapital'],
    number: ['max', 'min', 'nullable', 'int'],
    date: ['format', 'nullable', 'allowPast', 'allowFuture'],
    bool: ['nullable'],
    array: ['max', 'min', 'of', 'nullable'],
    enum: ['values', 'nullable', 'unique']
  };
  static #validationsForTokens = {
    max: this.#isNum,
    min: this.#isNum,
    nullable: this.#isBool,
    email: this.#isBool,
    int: this.#isBool,
    format: v => typeof v === 'string',
    allowPast: this.#isBool,
    allowFuture: this.#isBool,
    unique: this.#isBool,
    of: this.#isObj,
    values: v => this.#isUniqArray(v) && v.length > 1,
    letterSets: v =>
      this.#isUniqArray(v) &&
      v.length > 0 &&
      v.every(s => ['latin', 'numbers', 'symbols', 'spaces', 'nonLatin'].includes(s)),
    allowCapital: this.#isBool,
  };

  static #unpackTemplateConfig(config, parentArrayMax = null) {
    if (typeof config !== 'object') {
      return 'Config must be an object';
    }
    const { type, ...rest } = config;
    if (typeof type === 'object') {
      return this.unpackTemplateDump(type, parentArrayMax);
    }
    if (!(type in this.#allowedTokensForTypes)) {
      return `"${type}" is not a valid type definition`;
    }

    if (type === 'enum' && !rest.values) {
      return '"values" token is required for type "enum"';
    }
    if (type === 'array' && !rest.of) {
      return '"of" token is required for type "array"';
    }

    const allowedTokens = this.#allowedTokensForTypes[type];
    for (const [tokenName, tokenDef] of Object.entries(rest)) {
      if (!allowedTokens.includes(tokenName)) {
        return `"${tokenName}" is not a valid token for type "${type}"`;
      }
      if (!this.#validationsForTokens[tokenName](tokenDef)) {
        return `"${tokenDef}" is not a valid definition for token "${tokenName}"`;
      }
      if (tokenName === 'max' && rest.min != null && rest.min > tokenDef) {
        return '"max" must not be lower than "min"';
      }
      if (['max', 'min'].includes(tokenName) && type !== 'number' && tokenDef < 0) {
        return `Token "${tokenName}" for type "${type}" must have non-negative value`;
      }
      if (rest.email) {
        if (tokenName === 'max' && tokenDef !== 100) {
          return '"max" for emails is always 100';
        }
        if (tokenName === 'min' && tokenDef !== 15) {
          return '"min" for emails is always 15';
        }
      }
      if (tokenName === 'unique' && tokenDef && type === 'enum') {
        if (parentArrayMax == null) {
          return '"unique" = true is not allowed for top-level "enum" declarations';
        }
        if (parentArrayMax > rest.values.length) {
          return '"max" for arrays containing unique enums can\'t exceed "values" length';
        }
      }
      if (tokenName === 'of') {
        const inner = this.#unpackTemplateConfig(tokenDef, rest.max == null ? -1 : rest.max);
        if (inner) {
          return inner;
        }
      }
    }

    return null;
  }

  static unpackTemplateDump(dump, parentArrayMax = null) {
    for (const config of Object.values(dump)) {
      const configUnpackResult = this.#unpackTemplateConfig(config, parentArrayMax);
      if (configUnpackResult) {
        return configUnpackResult;
      }
    }

    return null;
  }

  static isUrl(value, relative) {
    if (!value) {
      return true;
    }
    try {
      const args = [value];
      if (relative) {
        args.push('http://localhost')
      }
      new URL(...args);
      return true;
    } catch {
      return false;
    }
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

addMethod(StringSchema, 'navRoute', function navRoute() {
  return this
    .test('navRoute', 'Not a valid route', (value, { createError }) => {
      if (!Validators.isUrl(value, true)) {
        return false;
      }
      return value.startsWith('/') || createError({ message: 'Route must start with /' });
    });
});

addMethod(StringSchema, 'relativeUrl', function relativeUrl() {
  return this
    .test('relativeUrl', 'Not a valid relative URL path', (value, { createError }) => {
      const [method, ...pathnameParts] = value.split(' ');
      if (!['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
        return createError({ message: `${method} is not a valid HTTP method` });
      }
      const pathname = pathnameParts.join(' ');
      if (!Validators.isUrl(pathname, true)) {
        return createError({ message: `${pathname} is not a valid URL pathname` });
      }
      return value.startsWith('/') || createError({ message: 'Relative URL must start with /' });
    });
});

addMethod(StringSchema, 'absoluteUrl', function absoluteUrl() {
  return this.test('absoluteUrl', 'Not a valid absolute URL path', value => Validators.isUrl(value));
});

addMethod(StringSchema, 'keyPattern', function keyPattern() {
  return this.navRoute().matches(/.*{key}.*/, 'Must contain {key} placeholder');
});

addMethod(ObjectSchema, 'templateConfig', function templateConfig(
  adjustEndpoints = endpointsSchema => endpointsSchema.min(1),
  routesCount = 1,
  specialIsRoute = false
) {
  const endpointsBase = array().of(string().relativeUrl()).canSkip();
  return this.shape({
    endpoints: adjustEndpoints(endpointsBase),
    routes: array().of(
      string().when('$body', {
        is: body => !!body.dump,
        then: schema => schema.keyPattern(),
        otherwise: schema => schema.navRoute()
      })
    ).canSkip().length(routesCount),
    special: string()[specialIsRoute ? 'navRoute' : 'relativeUrl']().canSkip()
  }).noUnknown().optional().onlyKind(Task.TASK_KINDS.react);
});

module.exports = Validators;
