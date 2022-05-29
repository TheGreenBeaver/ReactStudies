import React from 'react';
import { string } from 'prop-types';
import { Field } from 'formik';
import startCase from 'lodash/startCase';
import kebabCase from 'lodash/kebabCase';
import { TextField } from 'formik-mui';


function StandardTextField(props) {
  const fullProps = {
    label: startCase(props.name),
    component: TextField,
    margin: 'normal',
    size: 'small',
    fullWidth: true,
    autoComplete: kebabCase(props.name),
    ...props
  };

  return (
    <Field {...fullProps} />
  );
}

StandardTextField.propTypes = {
  ...TextField.propTypes,
  name: string.isRequired,
};

export default StandardTextField;