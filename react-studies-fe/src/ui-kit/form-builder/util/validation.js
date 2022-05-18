/* eslint-disable no-template-curly-in-string,default-case */
import { object, string, mixed } from 'yup';
import { mapValues } from 'lodash';
import { mimeFits } from './misc';

const FIELD_TYPES = {
  text: 'text',
  file: 'file',
  email: 'email',
};
const VALIDATION_MESSAGES = {
  required: 'This field is required',
  email: 'Not a valid email address',
  maxLength: '${path} must be less than ${max} characters'
};
const UNITS = { B: 'B', KB: 'KB', MB: 'MB', GB: 'GB', TB: 'TB' };

const unitsPower = Object.values(UNITS);
const bytesPerPower = 1024;

function composeFileValidator(val, unit = UNITS.MB, accept, multiple) {
  const power = unitsPower.indexOf(unit);
  const byteVal = val * Math.pow(bytesPerPower, power);

  if (multiple) {
    return mixed(inp => Array.isArray(inp) && inp.every(i => i instanceof File || typeof i === 'string'))
      .test(
        'fileSize', `Please select a file that's ${val}${unit} or below`,
        v => v.every(i => !i || typeof i === 'string' || i.size <= byteVal)
      )
      .test(
        'fileType', 'Please select a file of proper type',
        v => v.every(i => !i || typeof i === 'string' || mimeFits(i.type, accept))
      )
  }

  return mixed(inp => inp instanceof File || typeof inp === 'string')
    .test(
      'fileSize', `Please select a file that's ${val}${unit} or below`,
      v => !v || typeof v === 'string' || v.size <= byteVal
    )
    .test(
      'fileType', 'Please select a file of proper type',
      v => !v || typeof v === 'string' || mimeFits(v.type, accept)
    )
    .nullable();
}

function applyRequired(schema, required) {
  if (!required) {
    return schema;
  }

  if (typeof required === 'boolean') {
    return schema.required(VALIDATION_MESSAGES.required);
  }

  const [definingField, shouldBe] = typeof required === 'string' ? [required, true] : required;
  return schema.when(definingField, {
    is: shouldBe,
    then: schema => schema.required(VALIDATION_MESSAGES.required),
    otherwise: schema => schema.notRequired()
  });
}

function composeValidationSchema(validationConfig) {
  return object(mapValues(validationConfig, fieldConfig => {
    const [type, arg, required, modify] = fieldConfig;
    let schema;
    switch (type) {
      case FIELD_TYPES.text:
        schema = string().max(arg, VALIDATION_MESSAGES.maxLength);
        break;
      case FIELD_TYPES.file:
        schema = composeFileValidator(...arg);
        break;
      case FIELD_TYPES.email:
        schema = string().email(VALIDATION_MESSAGES.email);
    }
    schema = applyRequired(schema, required);
    return modify ? modify(schema) : schema;
  }));
}

export {
  UNITS, FIELD_TYPES, VALIDATION_MESSAGES,
  composeFileValidator, composeValidationSchema
};