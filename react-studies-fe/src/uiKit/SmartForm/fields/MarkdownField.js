import { arrayOf, string } from 'prop-types';
import { SomeFile } from '../../../util/types';
import useEditableView from '../../../hooks/useEditableView';
import Markdown from '../../Markdown';
import InputLabel from '@mui/material/InputLabel';


function MarkdownField({ name, label, localFiles, localFilesRefs }) {
  const { setFieldValue, values, isEditing } = useEditableView();
  const value = values[name];

  function setValue(val) {
    setFieldValue(name, val);
  }

  return (
    <>
      {!!label && <InputLabel>{label}</InputLabel>}
      <Markdown
        localFilesRefs={localFilesRefs}
        localFiles={localFiles}
        isEditing={isEditing}
        source={value}
        setValue={setValue}
      />
    </>
  );
}

MarkdownField.propTypes = {
  name: string.isRequired,
  label: string,
  localFiles: arrayOf(SomeFile),
  localFilesRefs: arrayOf(string),
};

export default MarkdownField;