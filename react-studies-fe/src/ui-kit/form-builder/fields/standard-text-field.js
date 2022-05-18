import React from 'react';
import { string } from 'prop-types';
import { TextField } from 'formik-mui';
import { Field } from 'formik';
import { kebabCase, startCase } from 'lodash';


function StandardTextField(props) {
  const _props = {
    label: startCase(props.name),
    component: TextField,
    margin: 'normal',
    size: 'small',
    fullWidth: true,
    autoComplete: kebabCase(props.name),
    ...props
  };

  return (
    <Field {..._props} />
  );
}

StandardTextField.propTypes = {
  name: string.isRequired
};

export default StandardTextField;