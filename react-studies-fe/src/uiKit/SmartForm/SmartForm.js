import React from 'react';
import { object, node, func, bool, string } from 'prop-types';
import { Form, Formik } from 'formik';
import GeneralError from './interactions/GeneralError';
import { SWITCHER } from '../../hooks/useEditableView';
import set from 'lodash/set';
import SubmitButton from './interactions/SubmitButton';
import { isSchema, object as yupObject } from 'yup';
import { finishSubmit } from '../../util/form';


function SmartForm({
  children,
  switching,
  initialIsEditing,
  initialValues,
  onSubmit,
  validationSchema,
  doNotPopulate,
  submitText,
  noSubmitLogic,
  onValidationFailed,
}) {
  const content = doNotPopulate
    ? children
    : <Form>
      {children}
      <SubmitButton
        fullWidth
        variant='contained'
        sx={{ mt: 3, mb: 2 }}
      >
        {submitText}
      </SubmitButton>
      <GeneralError />
    </Form>

  async function validate(values) {
    try {
      await yupObject().shape(validationSchema).validate(values, { abortEarly: false, strict: true });
      return {};
    } catch (e) {
      const errors = {};
      e.inner.forEach(innerErr => set(errors, innerErr.path, innerErr.errors.join('; ')));
      onValidationFailed?.(errors);
      return errors;
    }
  }

  const handleSubmit = noSubmitLogic
    ? (values, formikHelpers) => onSubmit(values, formikHelpers)
    : (values, formikHelpers) => finishSubmit(onSubmit(values, formikHelpers), formikHelpers);

  return (
    <Formik
      initialValues={initialValues}
      initialStatus={switching ? { [SWITCHER]: initialIsEditing } : undefined}
      validate={validate}
      onSubmit={handleSubmit}
    >
      {content}
    </Formik>
  );
}

SmartForm.propTypes = {
  initialValues: object.isRequired,
  children: node.isRequired,
  onSubmit: func.isRequired,
  switching: bool,
  initialIsEditing: bool,
  validationSchema: (props, propName) => {
    for (const validator of Object.values(props[propName])) {
      if (!isSchema(validator)){
        return new Error(`${propName} must be an object of Yup schemas`);
      }
    }
  },
  onValidationFailed: func,
  doNotPopulate: bool,
  noSubmitLogic: bool,
  submitText: string
};

SmartForm.defaultProps = {
  switching: false,
  initialIsEditing: false,
  doNotPopulate: false
};

export default SmartForm;