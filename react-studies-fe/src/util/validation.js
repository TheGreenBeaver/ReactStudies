import { array, mixed, object, setLocale, string, ArraySchema } from 'yup';
import startCase from 'lodash/startCase';
import { humanizeFileSize, serializeFileSize } from './misc';
import isEqual from 'lodash/isEqual';
import { CAVEAT_FIELDS, ELEMENT_FIELDS, ELEMENT_FIELDS_EMPTY } from './constants';


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

  static #requiredSchema(schema) {
    return schema instanceof ArraySchema ? schema.min(1) : schema.required();
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

  static email() {
    return string().email().required();
  }

  static file(accept, maxSize, { multiple, required } = {}) {
    const humanizedMaxSize = Array.isArray(maxSize) ? maxSize.join(' ') : humanizeFileSize(maxSize);
    const serializedFileSize = Array.isArray(maxSize) ? serializeFileSize(...maxSize) : maxSize;

    const singleFileSchema = mixed()
      .test('singleFile', 'Validation error', (value, { path, createError }) => {
        if (!value || isEqual(Object.keys(value), ['location', 'mime', 'id'])) {
          return true;
        }
        if (!(value instanceof File)) {
          return createError({ message: `${startCase(path)} must be a file` });
        }
        if (value.size > serializedFileSize) {
          return createError({ message: `File size must not exceed ${humanizedMaxSize}` });
        }
        if (!this.#mimeFits(value.type, accept)) {
          return createError({ message: 'The file type is not supported' });
        }
        return true;
      });

    const baseSchema = multiple ? array().of(singleFileSchema) : singleFileSchema;
    return required ? this.#requiredSchema(baseSchema) : baseSchema;
  }

  static elementList(requiredElementFields = []) {
    const singleElementSchema = {
      [ELEMENT_FIELDS.tag]: string().max(20).test('isValidTag', '${tag} is not a valid tag', (value, { createError }) => {
        if (!value) {
          return true;
        }
        try {
          const element = document.createElement(value);
          return element instanceof HTMLUnknownElement ? createError({ params: { tag: value } }) : true;
        } catch {
          return createError({ params: { tag: value } });
        }
      }),
      [ELEMENT_FIELDS.content]: this.uniqList(
        string().required('Text blocks must not be empty'), 'Text block'
      )
    };
    requiredElementFields.forEach(field => {
      if (!Array.isArray(ELEMENT_FIELDS_EMPTY[field])) {
        singleElementSchema[field] = singleElementSchema[field].required(`${startCase(field)} is required`);
      }
    });
    return array().of(object(singleElementSchema));
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
      [CAVEAT_FIELDS.maxUsage]: this.numeric(min, max, true).label('Threshold').optional(),
      [CAVEAT_FIELDS.allowedFor]: this.#requiredSchema(this.elementList().label('rule')).nullable().optional()
    }).nullable().optional();
  }

  static gitHubToken() {
    return string().matches(/ghp_\w{36}/, 'Not a valid Personal Access Token');
  }
}

export default Validators;