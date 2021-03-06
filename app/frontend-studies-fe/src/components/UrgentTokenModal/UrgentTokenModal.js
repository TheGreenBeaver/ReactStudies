import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import MuiLink from '@mui/material/Link';
import PasswordField from '../../uiKit/SmartForm/fields/PasswordField';
import { TOKEN_FIELDS, TOKEN_INFO } from '../../util/constants';
import CheckboxField from '../../uiKit/SmartForm/fields/CheckboxField';
import DialogActions from '@mui/material/DialogActions';
import SubmitButton from '../../uiKit/SmartForm/interactions/SubmitButton';
import Dialog from '@mui/material/Dialog';
import { useDispatch, useSelector } from 'react-redux';
import SmartForm from '../../uiKit/SmartForm';
import api from '../../api';
import { updateUserData } from '../../store/slices/account';
import { setUrgentTokenModalOpen } from '../../store/slices/misc';
import { Form } from 'formik';
import Validators from '../../util/validation';
import { wAmount } from '../../util/misc';
import Warning from '@mui/icons-material/Warning';


function UrgentTokenModal() {
  const dispatch = useDispatch();
  const open = useSelector(state => state.misc.urgentTokenModalOpen);
  const unprocessedResultsAmt = useSelector(state =>
    state.account.userData.solutions.reduce((amt, { results }) => amt + results.length, 0)
  );

  return (
    <Dialog open={open} onClose={() => {}} keepMounted={false}>
      <DialogTitle alignItems='center' display='flex' columnGap={1}>
        <Warning />
        {wAmount(unprocessedResultsAmt, 'unprocessed solution result')}
      </DialogTitle>
      <SmartForm
        initialValues={{
          [TOKEN_FIELDS.gitHubToken]: '',
          [TOKEN_FIELDS.rememberToken]: true
        }}
        onSubmit={values => api.solutions
          .sendUrgentToken(values)
          .then(({ gitHubToken }) => {
            dispatch(updateUserData({ gitHubToken, solutions: [] }));
            dispatch(setUrgentTokenModalOpen(false));
          })
        }
        doNotPopulate
        validationSchema={{
          [TOKEN_FIELDS.gitHubToken]: Validators.gitHubToken(),
        }}
      >
        {({ values }) => (
          <Form>
            <DialogContent>
              <DialogContentText>
                Please provide your{' '}
                <MuiLink href={TOKEN_INFO}>GitHub Personal Access Token</MuiLink>{' '}
                so that we can download and process the results for your solutions
              </DialogContentText>
              <PasswordField name={TOKEN_FIELDS.gitHubToken} label='Token' autoComplete='false' />
              <CheckboxField label='Remember my token' name={TOKEN_FIELDS.rememberToken} />
            </DialogContent>
            <DialogActions>
              <SubmitButton disabled={!values[TOKEN_FIELDS.gitHubToken]} type='submit'>
                Submit
              </SubmitButton>
            </DialogActions>
          </Form>
        )}
      </SmartForm>
    </Dialog>
  );
}

export default UrgentTokenModal;