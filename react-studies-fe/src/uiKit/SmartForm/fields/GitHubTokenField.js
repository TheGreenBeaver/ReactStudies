import { string } from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import startCase from 'lodash/startCase';
import PasswordField from './PasswordField';
import CheckboxField from './CheckboxField';
import Button from '@mui/material/Button';
import { TOKEN_FIELDS } from '../../../util/constants';
import { useFormikContext } from 'formik';
import { useSelector } from 'react-redux';
import SubmitButton from '../interactions/SubmitButton';
import { useEffect } from 'react';
import isEmpty from 'lodash/isEmpty';
import mapValues from 'lodash/mapValues';
import useMountedState from '../../../hooks/useMountedState';


const infoLink = 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token';

function mapErrorsToTouched(errors) {
  return mapValues(errors, singleErr => {
    if (typeof singleErr === 'string') {
      return true;
    }
    if (Array.isArray(singleErr)) {
      const mapper = typeof singleErr[0] === 'string' ? () => true : mapErrorsToTouched;
      return singleErr.map(mapper);
    }
    return mapErrorsToTouched(singleErr);
  });
}

function GitHubTokenField({ action, entity, ...buttonProps }) {
  const [open, setOpen] = useMountedState(false);
  const { submitForm, values, validateForm, setTouched, isSubmitting, errors, submitCount } = useFormikContext();
  const { gitHubToken } = useSelector(state => state.account.userData);

  const tokenValue = values[TOKEN_FIELDS.gitHubToken];

  useEffect(() => {
    if (!isSubmitting && submitCount && !errors[TOKEN_FIELDS.gitHubToken]) {
      setOpen(false);
    }
  }, [isSubmitting]);

  async function onSubmitAttempt() {
    if (gitHubToken) {
      return submitForm();
    }

    const errors = await validateForm();
    if (isEmpty(errors)) {
      setOpen(true);
    } else {
      setTouched(mapErrorsToTouched(errors), false);
    }
  }

  function onClose() {
    if (!isSubmitting) {
      setOpen(false);
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} keepMounted={false}>
        <DialogTitle>{startCase(action)} {entity}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide your{' '}
            <a href={infoLink} target='_blank' rel='noopener noreferrer'>GitHub Personal Access Token</a>{' '}
            so that we can {action} repository for this {entity}
          </DialogContentText>
          <PasswordField name={TOKEN_FIELDS.gitHubToken} label='Token' autoComplete='false' />
          <CheckboxField label='Remember my token' name={TOKEN_FIELDS.rememberToken} />
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' disabled={isSubmitting} onClick={onClose}>Cancel</Button>
          <SubmitButton type='submit' disabled={!tokenValue}>
            Submit
          </SubmitButton>
        </DialogActions>
      </Dialog>
      <SubmitButton {...buttonProps} onClick={onSubmitAttempt}>
        Create
      </SubmitButton>
    </>
  );
}

GitHubTokenField.propTypes = {
  action: string.isRequired,
  entity: string.isRequired,
};

export default GitHubTokenField;