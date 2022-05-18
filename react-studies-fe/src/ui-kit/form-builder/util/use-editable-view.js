import { useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import { getUpd } from '../../../util/misc';


const SWITCHER = 'isEditing';

function useEditableView() {
  const formikContext = useFormikContext();
  const { status, setStatus, resetForm } = formikContext;
  const isEditing = isEmpty(status) || (!(SWITCHER in status))
    ? true
    : status[SWITCHER];

  function setIsEditing(upd) {
    return setStatus({ [SWITCHER]: getUpd(upd, isEditing) });
  }

  function resetAndExit() {
    resetForm({ status: { [SWITCHER]: false } });
  }

  return { ...formikContext, isEditing, setIsEditing, resetAndExit };
}

export { SWITCHER };
export default useEditableView;