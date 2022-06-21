import ElementsListField from '../../../../uiKit/SmartForm/fields/ElementsListField';
import fieldNames from '../../fieldNames';
import { ELEMENT_FIELDS } from '../../../../util/constants';
import Typography from '@mui/material/Typography';
import CaveatField from '../../../../uiKit/SmartForm/fields/CaveatField';


function AdvancedLayoutSettings() {
  return (
    <>
      <Typography variant='h6'>Must-use tags</Typography>
      <ElementsListField
        name={fieldNames.mustUse}
        requiredElementFields={[ELEMENT_FIELDS.tag]}
        prefixes={{
          [ELEMENT_FIELDS.tag]: 'Must use this tag:',
          [ELEMENT_FIELDS.content]: '...to display these:'
        }}
      />
      <CaveatField
        mt={3}
        prefixes={{
          [ELEMENT_FIELDS.tag]: 'Allow for this tag:',
          [ELEMENT_FIELDS.content]: values => values[ELEMENT_FIELDS.tag] != null
            ? '...if it contains one of these:'
            : 'Allow for any tag containing one of these:',
        }}
        name={fieldNames.absPos}
        trackName={fieldNames.trackAbsPos}
        recommended={10}
        label='absolute positioning overuse'
      />
      <CaveatField
        mt={3}
        prefixes={{
          [ELEMENT_FIELDS.tag]: 'Allow for this tag:',
          [ELEMENT_FIELDS.content]: values => values[ELEMENT_FIELDS.tag] != null
            ? '...if it contains one of these:'
            : 'Allow for any tag containing one of these:',
        }}
        name={fieldNames.rawSizing}
        trackName={fieldNames.trackRawSizing}
        recommended={40}
        label='non-responsive raw pixel sizing'
      />
    </>
  );
}

export default AdvancedLayoutSettings;