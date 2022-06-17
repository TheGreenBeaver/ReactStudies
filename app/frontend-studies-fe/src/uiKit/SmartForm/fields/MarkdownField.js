import { arrayOf, string } from 'prop-types';
import { SomeFile } from '../../../util/types';
import useEditableView from '../../../hooks/useEditableView';
import Markdown from '../../Markdown';


function MarkdownField({ name, localFiles, localFilesRefs }) {
  const { setFieldValue, values, isEditing, isSubmitting } = useEditableView();
  const value = values[name];

  function setValue(val) {
    setFieldValue(name, val);
  }

  return (
    <Markdown
      localFilesRefs={localFilesRefs}
      localFiles={localFiles}
      isEditing={isEditing}
      source={value}
      setValue={setValue}
      disabled={isSubmitting}
    />
  );
}

MarkdownField.propTypes = {
  name: string.isRequired,
  localFiles: arrayOf(SomeFile),
  localFilesRefs: arrayOf(string),
};

export default MarkdownField;