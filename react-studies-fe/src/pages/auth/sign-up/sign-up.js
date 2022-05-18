import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import StyledLink from '../../../ui-kit/styled-link';
import { links } from '../routing';
import { useDispatch } from 'react-redux';
import { signIn } from '../../../store/actions/account';
import PasswordField from '../../../ui-kit/form-builder/fields/password-field';
import SmartForm from '../../../ui-kit/form-builder/smart-form';
import { FIELD_TYPES } from '../../../ui-kit/form-builder/util/validation';
import finishSubmit from '../../../ui-kit/form-builder/util/finish-submit';
import StandardTextField from '../../../ui-kit/form-builder/fields/standard-text-field';
import usersService from '../../../api/users';
import CheckboxField from '../../../ui-kit/form-builder/fields/checkbox-field';


const fieldNames = {
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  password: 'password',
  isTeacher: 'isTeacher'
};

function SignUp() {
  const dispatch = useDispatch();

  return (
    <>
      <Typography component='h1' variant='h5'>
        Sign up
      </Typography>
      <Box mt={3}>
        <SmartForm
          submitText='Sign up'
          initialValues={{
            [fieldNames.firstName]: '',
            [fieldNames.lastName]: '',
            [fieldNames.email]: '',
            [fieldNames.password]: '',
            [fieldNames.isTeacher]: false
          }}
          validationConfig={{
            [fieldNames.firstName]: [FIELD_TYPES.text, 30, true],
            [fieldNames.lastName]: [FIELD_TYPES.text, 30, true],
            [fieldNames.email]: [FIELD_TYPES.email, null, true],
            [fieldNames.password]: [FIELD_TYPES.text, 100, true]
          }}
          onSubmit={(values, formikHelpers) => finishSubmit(
            usersService.create(values).then(({ data }) =>
              dispatch(signIn(data.token))
            ), formikHelpers
          )}
        >
          <StandardTextField required name={fieldNames.firstName} autoComplete='given-name' />
          <StandardTextField required name={fieldNames.lastName} autoComplete='family-name' />
          <StandardTextField required name={fieldNames.email} />
          <PasswordField required name={fieldNames.password} autoComplete='new-password' />
          <CheckboxField label='I am a teacher' name={fieldNames.isTeacher} />
        </SmartForm>
        <Box justifyContent='flex-end' display='flex' alignItems='center'>
          <StyledLink to={links.signIn.path} variant='body2'>
            Already have an account? Sign in
          </StyledLink>
        </Box>
      </Box>
    </>);
}

export default SignUp;