import { arrayOf, number, oneOf, string } from 'prop-types';
import { CAVEAT_FIELDS, ELEMENT_FIELDS } from '../../../../util/constants';
import useEditableView from '../../../../hooks/useEditableView';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { getUpd } from '../../../../util/misc';
import Typography from '@mui/material/Typography';
import MaxUsage from './MaxUsage';
import ElementsListField from '../ElementsListField';
import { Prefixes } from '../../../../util/types';
import Collapse from '@mui/material/Collapse';
import useCollapse from '../../../../hooks/useCollapse';


function CaveatField({
  name,
  label,
  requiredElementFields,
  prefixes,
  recommended,
  ...wrapperProps
}) {
  const { values, setFieldValue } = useEditableView();
  const value = values[name];
  const shouldTrack = !!value;
  const enteringAllowedFor = !!value?.[CAVEAT_FIELDS.allowedFor];

  function setValue(upd) {
    setFieldValue(name, getUpd(upd, value));
  }

  function setShouldTrack(newShouldTrack) {
    setValue(newShouldTrack ? { [CAVEAT_FIELDS.maxUsage]: null, [CAVEAT_FIELDS.allowedFor]: null } : null);
  }

  function setEnteringAllowedFor(newEnteringAllowedFor) {
    setValue(curr => ({ ...curr, [CAVEAT_FIELDS.allowedFor]: newEnteringAllowedFor ? [] : null }));
  }

  const [shouldTrackCollapseProps, closeShouldTrackCollapse] = useCollapse(
    () => setShouldTrack(false), shouldTrack
  );
  const [enteringAllowedForCollapseProps, closeEnteringAllowedForCollapse] = useCollapse(
    () => setEnteringAllowedFor(false), enteringAllowedFor
  );

  function toggleShouldTrack({ target: { checked } }) {
    if (checked) {
      setShouldTrack(true);
    } else {
      closeShouldTrackCollapse();
    }
  }

  function toggleEnteringAllowedFor({ target: { checked } }) {
    if (checked) {
      setEnteringAllowedFor(true);
    } else {
      closeEnteringAllowedForCollapse();
    }
  }

  return (
    <Box {...wrapperProps}>
      <FormControlLabel
        control={<Checkbox checked={shouldTrack} onChange={toggleShouldTrack} />}
        label={<Typography variant='h6'>Common caveat{label ? `: ${label}` : ''}</Typography>}
      />
      <Collapse {...shouldTrackCollapseProps} orientation='vertical'>
        <MaxUsage name={`${name}.${CAVEAT_FIELDS.maxUsage}`} recommended={recommended} />
        <FormControlLabel
          control={<Checkbox checked={enteringAllowedFor} onChange={toggleEnteringAllowedFor} />}
          label='Allow usage for certain tags'
        />
        <Collapse {...enteringAllowedForCollapseProps} orientation='vertical'>
          <ElementsListField
            name={`${name}.${CAVEAT_FIELDS.allowedFor}`}
            prefixes={prefixes}
            requiredElementFields={requiredElementFields}
          />
        </Collapse>
      </Collapse>
    </Box>
  );
}

CaveatField.propTypes = {
  name: string.isRequired,
  label: string,
  requiredElementFields: arrayOf(oneOf([...Object.values(ELEMENT_FIELDS)])),
  prefixes: Prefixes.isRequired,
  recommended: number,
};

CaveatField.defaultProps = {
  requiredElementFields: [],
  recommended: 25
};

export default CaveatField;