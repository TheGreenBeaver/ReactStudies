import mapValues from 'lodash/mapValues';
import values from 'lodash/values';
import { GITHUB_ERR, NON_FIELD_ERR } from './constants';


function flattenBackendError(errorData) {
  return mapValues(errorData, v => {
    if (Array.isArray(v)) {
      return typeof v[0] === 'string' ? v.join(';') : v.map(flattenBackendError);
    }
    return flattenBackendError(v);
  });
}

function finishSubmit(req, formikHelpers) {
  formikHelpers.setSubmitting(true);
  return req
    .catch(e => {
      const errorsObj = e.response.data[GITHUB_ERR]
        ? { [NON_FIELD_ERR]: `GitHub error: ${values(e.response.data).filter(v => typeof v !== 'boolean').join('; ')}` }
        : flattenBackendError(e.response.data);
      formikHelpers.setErrors(errorsObj);
      formikHelpers.setSubmitting(false);
    });
}

function serializeValue(value) {
  if (value instanceof File) {
    return [value, value.name];
  }
  if (typeof value === 'object') {
    return [JSON.stringify(value)];
  }
  return [value];
}

function getFormData(values, fields = Object.keys(values)) {
  const formData = new FormData();
  fields.forEach(field => {
    const rawValue = values[field];
    if (rawValue == null) {
      return;
    }
    if (Array.isArray(rawValue)) {
      rawValue.forEach(entry => formData.append(field, ...serializeValue(entry)));
    } else {
      formData.append(field, ...serializeValue(rawValue));
    }
  });
  return formData;
}

export { finishSubmit, getFormData };