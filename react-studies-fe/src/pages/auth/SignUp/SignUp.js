import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import links from '../links';
import { useDispatch } from 'react-redux';
import { signIn } from '../../../store/slices/account';
import PasswordField from '../../../uiKit/SmartForm/fields/PasswordField';
import SmartForm from '../../../uiKit/SmartForm';
import StandardTextField from '../../../uiKit/SmartForm/fields/StandardTextField';
import api from '../../../api';
import CheckboxField from '../../../uiKit/SmartForm/fields/CheckboxField';
import StyledLink from '../../../uiKit/StyledLink';
import Validators from '../../../util/validation';


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
      <Typography variant='h4'>
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
          validationSchema={{
            [fieldNames.firstName]: Validators.standardText(30),
            [fieldNames.lastName]: Validators.standardText(30),
            [fieldNames.email]: Validators.email(),
            [fieldNames.password]: Validators.standardText(100)
          }}
          onSubmit={(values) => api.users.create(values).then(({ data }) => dispatch(signIn(data.token)))}
        >
          <StandardTextField required name={fieldNames.firstName} autoComplete='given-name' />
          <StandardTextField required name={fieldNames.lastName} autoComplete='family-name' />
          <StandardTextField required name={fieldNames.email} />
          <PasswordField required name={fieldNames.password} autoComplete='new-password' />
          <CheckboxField label='I am a teacher' name={fieldNames.isTeacher} />
        </SmartForm>
        <Box justifyContent='flex-end' display='flex' alignItems='center'>
          <StyledLink to={links.signIn} variant='body2'>
            Already have an account? Sign in
          </StyledLink>
        </Box>
      </Box>
    </>
  );
}

export default SignUp;