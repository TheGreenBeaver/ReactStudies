import MainLayoutSettings from './MainLayoutSettings';
import MainReactSettings from './MainReactSettings';
import { TASK_KINDS } from '../../../../util/constants';
import { useField } from 'formik';
import fieldNames from '../../fieldNames';


const TYPE_SETTINGS = {
  [TASK_KINDS.layout]: MainLayoutSettings,
  [TASK_KINDS.react]: MainReactSettings
}

function MainTypeSettings() {
  const [{ value }] = useField(fieldNames.kind);
  const Component = TYPE_SETTINGS[value];
  return <Component />;
}

export default MainTypeSettings;