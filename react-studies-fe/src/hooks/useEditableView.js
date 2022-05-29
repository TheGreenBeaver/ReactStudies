import { useFormikContext } from 'formik';
import isEmpty from 'lodash/isEmpty';
import { getUpd } from '../util/misc';
import { useMemo } from 'react';


const SWITCHER = Symbol();

function useEditableView() {
  const formikContext = useFormikContext();
  const { status, setStatus, resetForm } = formikContext;
  const isEditing = useMemo(
    () => isEmpty(status) || (!(SWITCHER in status)) ? true : status[SWITCHER],
    [status]
  );

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