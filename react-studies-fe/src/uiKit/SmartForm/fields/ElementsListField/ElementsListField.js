import { string } from 'prop-types';
import useEditableView from '../../../../hooks/useEditableView';
import { getUpd } from '../../../../util/misc';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import Add from '@mui/icons-material/Add';
import SingleElement from './SingleElement';
import { ELEMENT_FIELDS, ELEMENT_FIELDS_EMPTY } from '../../../../util/constants';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { ElementFields, Prefixes } from '../../../../util/types';
import FormHelperText from '@mui/material/FormHelperText';


function ElementsListField({ name, label, requiredElementFields, prefixes }) {
  const { values, setFieldValue, errors, touched, setFieldTouched, isSubmitting } = useEditableView();
  const value = get(values, name);
  const topLevelError = get(errors, name);
  const topLevelTouched = get(touched, name);

  function getErrorProps(idxInList, elementField, idxInField) {
    const extractData = formData => {
      const elementFieldLevel = get(formData, name)?.[idxInList]?.[elementField];
      return idxInField == null ? elementFieldLevel : elementFieldLevel?.[idxInField];
    };
    const inputError = extractData(errors);
    const inputTouched = extractData(touched);
    const errorText = inputTouched && inputError;
    return { error: !!errorText, helperText: errorText };
  }

  function setValue(upd) {
    setFieldValue(name, getUpd(upd, value));
  }

  function addElement() {
    const newSingleElement = requiredElementFields.reduce((res, f) => ({
      ...res, [f]: ELEMENT_FIELDS_EMPTY[f]
    }), {});
    if (isEmpty(newSingleElement)) {
      newSingleElement[ELEMENT_FIELDS.tag] = ELEMENT_FIELDS_EMPTY[ELEMENT_FIELDS.tag];
    }
    setFieldTouched(name, true, false);
    setValue(curr => [...curr, newSingleElement]);
  }

  return (
    <Box>
      {label && <InputLabel>{label}</InputLabel>}
      <FormHelperText error>
        {topLevelTouched && typeof topLevelError === 'string' && topLevelError}
      </FormHelperText>
      {
        value.map((singleValue, idx) =>
          <SingleElement
            prefixes={prefixes}
            key={idx}
            onChange={upd => setValue(curr => {
              const newValue = [...curr];
              newValue[idx] = getUpd(upd, curr[idx]);
              return newValue;
            })}
            onBlur={(elementField, subIdx) => {
              const fullPath = `${name}[${idx}].${elementField}${subIdx == null ? '' : `[${subIdx}]`}`;
              setFieldTouched(fullPath, true);
            }}
            getErrorProps={(elementField, idxInField) => getErrorProps(idx, elementField, idxInField)}
            value={singleValue}
            remove={() => setValue(curr => curr.filter((_, i) => i !== idx))}
            requiredElementFields={requiredElementFields}
          />
        )
      }

      <Button
        variant='outlined'
        startIcon={<Add />}
        disabled={isSubmitting}
        sx={{ mt: 1 }}
        onClick={addElement}
      >
        Add tag
      </Button>
    </Box>
  );
}

ElementsListField.propTypes = {
  name: string.isRequired,
  label: string,
  requiredElementFields: ElementFields,
  prefixes: Prefixes.isRequired,
};

ElementsListField.defaultProps = {
  requiredElementFields: [],
};

export default ElementsListField;