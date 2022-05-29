import { func, bool, string } from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import startCase from 'lodash/startCase';
import PasswordField from '../../uiKit/SmartForm/fields/PasswordField';
import CheckboxField from '../../uiKit/SmartForm/fields/CheckboxField';
import Button from '@mui/material/Button';
import { TOKEN_FIELDS } from '../../util/constants';
import { useFormikContext } from 'formik';


const infoLink = 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token';

function GitHubTokenModal({ action, onClose, entity, open }) {
  const { setSubmitting, submitForm } = useFormikContext();
  function handleCancel() {
    setSubmitting(false);
    onClose();
  }
  return (
    <Dialog open={open} onClose={handleCancel} keepMounted={false}>
      <DialogTitle>{startCase(action)} {entity}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please provide your{' '}
          <a href={infoLink} target='_blank' rel='noopener noreferrer'>GitHub Personal Access Token</a>{' '}
          so that we can {action} repository for this {entity}
        </DialogContentText>
        <PasswordField disabled={false} name={TOKEN_FIELDS.gitHubToken} label='Token' autoComplete='false' />
        <CheckboxField label='Remember my token' name={TOKEN_FIELDS.rememberToken} />
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' onClick={handleCancel}>Cancel</Button>
        <Button variant='contained' type='submit' onClick={submitForm}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
}

GitHubTokenModal.propTypes = {
  onClose: func.isRequired,
  open: bool.isRequired,
  action: string.isRequired,
  entity: string.isRequired,
};

export default GitHubTokenModal;