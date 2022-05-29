import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import StyledLink from '../../../uiKit/StyledLink';
import links from '../links';
import { useDispatch } from 'react-redux';
import { signIn } from '../../../store/slices/account';
import PasswordField from '../../../uiKit/SmartForm/fields/PasswordField';
import SmartForm from '../../../uiKit/SmartForm';
import StandardTextField from '../../../uiKit/SmartForm/fields/StandardTextField';
import api from '../../../api';
import Validators from '../../../util/validation';


const fieldNames = {
  email: 'email',
  password: 'password',
};

function SignIn() {
  const dispatch = useDispatch();

  return (
    <>
      <Typography variant='h4'>
        Sign in
      </Typography>
      <Box sx={{ mt: 1 }}>
        <SmartForm
          submitText='Sign in'
          initialValues={{ [fieldNames.email]: '', [fieldNames.password]: '' }}
          validationSchema={{
            [fieldNames.email]: Validators.email(),
            [fieldNames.password]: Validators.standardText(100)
          }}
          onSubmit={(values) => api.auth.signIn(values).then(({ data }) => dispatch(signIn(data.token)))}
        >
          <StandardTextField required name={fieldNames.email} />
          <PasswordField required name={fieldNames.password} autoComplete='current-password' />
        </SmartForm>

        <Grid container>
          <Grid item xs>
            <StyledLink to={links.resetPassword} variant='body2'>
              Forgot password?
            </StyledLink>
          </Grid>
          <Grid item>
            <StyledLink to={links.signUp} variant='body2'>
              Don't have an account? Sign Up
            </StyledLink>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default SignIn;
