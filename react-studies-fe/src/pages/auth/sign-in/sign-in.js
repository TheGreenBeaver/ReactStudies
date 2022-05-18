import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import StyledLink from '../../../ui-kit/styled-link';
import { links } from '../routing';
import { useDispatch } from 'react-redux';
import { signIn } from '../../../store/actions/account';
import PasswordField from '../../../ui-kit/form-builder/fields/password-field';
import SmartForm from '../../../ui-kit/form-builder/smart-form';
import { FIELD_TYPES } from '../../../ui-kit/form-builder/util/validation';
import finishSubmit from '../../../ui-kit/form-builder/util/finish-submit';
import StandardTextField from '../../../ui-kit/form-builder/fields/standard-text-field';
import authService from '../../../api/auth';


const fieldNames = {
  email: 'email',
  password: 'password',
};

function SignIn() {
  const dispatch = useDispatch();

  return (
    <>
      <Typography component='h1' variant='h5'>
        Sign in
      </Typography>
      <Box sx={{ mt: 1 }}>
        <SmartForm
          submitText='Sign in'
          initialValues={{ [fieldNames.email]: '', [fieldNames.password]: '' }}
          validationConfig={{
            [fieldNames.email]: [FIELD_TYPES.email, null, true],
            [fieldNames.password]: [FIELD_TYPES.text, 100, true]
          }}
          onSubmit={(values, formikHelpers) => finishSubmit(
            authService.signIn(values).then(({ data }) =>
              dispatch(signIn(data.token))
            ), formikHelpers
          )}
        >
          <StandardTextField required name={fieldNames.email} />
          <PasswordField required name={fieldNames.password} autoComplete='current-password' />
        </SmartForm>

        <Grid container>
          <Grid item xs>
            <StyledLink to={links.resetPassword.path} variant='body2'>
              Forgot password?
            </StyledLink>
          </Grid>
          <Grid item>
            <StyledLink to={links.signUp.path} variant='body2'>
              Don't have an account? Sign Up
            </StyledLink>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default SignIn;