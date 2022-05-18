import React from 'react';
import { object, node, func, bool, objectOf, array, string } from 'prop-types';
import { Form, Formik } from 'formik';
import { composeValidationSchema } from './util/validation';
import GeneralError from './interactions/general-error';
import { SWITCHER } from './util/use-editable-view';
import { mapValues } from 'lodash';
import SubmitButton from './interactions/submit-button';
import { NON_FIELD_ERRORS } from './util/misc';


function SmartForm({ children, switching, initialIsEditing, initialValues, onSubmit, validationConfig, doNotPopulate, submitText }) {
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

  return (
    <Formik
      initialValues={initialValues}
      initialErrors={{ ...mapValues(initialValues, () => null), [NON_FIELD_ERRORS]: null }}
      initialStatus={switching ? { [SWITCHER]: initialIsEditing } : undefined}
      validationSchema={composeValidationSchema(validationConfig)}
      onSubmit={onSubmit}
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
  validationConfig: objectOf(array).isRequired,
  doNotPopulate: bool,
  submitText: string
};

SmartForm.defaultProps = {
  switching: false,
  initialIsEditing: false,
  doNotPopulate: false
};

export default SmartForm;