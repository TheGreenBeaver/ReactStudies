import CheckboxField from '../../../../../uiKit/SmartForm/fields/CheckboxField';
import fieldNames from '../../../fieldNames';
import { useFormikContext } from 'formik';
import DumpInput from './DumpInput';


function AdvancedReactSettings() {
  const { values } = useFormikContext();
  const dumpMakesSense = !!(values[fieldNames.singleEntityTemplate] || values[fieldNames.entityListTemplate]);

  return (
    <>
      <CheckboxField label='Perform fuzz-testing' name={fieldNames.hasFuzzing} />
      {dumpMakesSense && <DumpInput />}
    </>
  );
}

export default AdvancedReactSettings;