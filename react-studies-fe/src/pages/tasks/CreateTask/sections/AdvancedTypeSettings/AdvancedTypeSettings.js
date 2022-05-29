import { TASK_KINDS } from '../../../../../util/constants';
import AdvancedLayoutSettings from './AdvancedLayoutSettings';
import AdvancedReactSettings from './AdvancedReactSettings';
import { useField } from 'formik';
import fieldNames from '../../fieldNames';


const TYPE_SETTINGS = {
  [TASK_KINDS.layout]: AdvancedLayoutSettings,
  [TASK_KINDS.react]: AdvancedReactSettings
};

function AdvancedTypeSettings() {
  const [{ value }] = useField(fieldNames.kind);
  const Component = TYPE_SETTINGS[value];
  return <Component />;
}

export default AdvancedTypeSettings;