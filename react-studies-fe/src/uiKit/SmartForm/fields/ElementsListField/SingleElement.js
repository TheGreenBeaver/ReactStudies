import { func } from 'prop-types';
import Typography from '@mui/material/Typography';
import isEmpty from 'lodash/isEmpty';
import { ELEMENT_FIELDS, ELEMENT_FIELDS_EMPTY } from '../../../../util/constants';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import MultiText from './MultiText';
import { getUpd } from '../../../../util/misc';
import { ElementData, ElementFields, Prefixes } from '../../../../util/types';


const elementFieldsList = Object.values(ELEMENT_FIELDS);

function SingleElement({ value, onChange, requiredElementFields, prefixes, remove, getErrorProps, onBlur }) {
  function onRequire(elementField) {
    onChange(curr => ({ ...curr, [elementField]: ELEMENT_FIELDS_EMPTY[elementField] }));
  }

  function onDecline(elementField) {
    onChange(curr => {
      const updated = { ...curr };
      delete updated[elementField];
      if (isEmpty(updated)) {
        const otherField = elementFieldsList.find(field => field !== elementField);
        updated[otherField] = ELEMENT_FIELDS_EMPTY[otherField];
      }
      return updated;
    });
  }

  function hasField(elementField) {
    return elementField in value;
  }

  function getPrefix(prefix) {
    return typeof prefix === 'function' ? prefix(value) : prefix;
  }

  return (
    <Box
      display='flex'
      columnGap={1}
      sx={{ '&:not(:last-of-type)': { mb: 2.25 }, ml: -0.75 }}
    >
      <IconButton onClick={remove} color='error' sx={{ p: 0.5, height: 'fit-content', mt: 0.5 }}>
        <DeleteOutlined />
      </IconButton>
      {
        elementFieldsList.map(elementField =>
          <Box key={elementField} display='flex' columnGap={0.5}>
            {
              !requiredElementFields.includes(elementField) &&
              <Checkbox
                sx={{ p: 0.5, mt: 0.5, height: 'fit-content' }}
                onChange={e => e.target.checked ? onRequire(elementField) : onDecline(elementField)}
                checked={hasField(elementField)}
              />
            }
            <Typography mt={1} whiteSpace='nowrap' color={hasField(elementField) ? 'text.primary' : 'text.disabled'}>
              {getPrefix(prefixes[elementField])}
            </Typography>
            <MultiText
              getErrorProps={idxInField => getErrorProps(elementField, idxInField)}
              onBlur={subIdx => onBlur(elementField, subIdx)}
              disabled={!hasField(elementField)}
              onChange={upd => onChange(curr => ({
                ...curr, [elementField]: getUpd(upd, curr[elementField]),
              }))}
              value={value[elementField] || ELEMENT_FIELDS_EMPTY[elementField]}
            />
          </Box>
        )
      }
    </Box>
  );
}

SingleElement.propTypes = {
  remove: func.isRequired,
  value: ElementData.isRequired,
  getErrorProps: func.isRequired,
  prefixes: Prefixes.isRequired,
  onChange: func.isRequired,
  onBlur: func.isRequired,
  requiredElementFields: ElementFields
};

export default SingleElement;