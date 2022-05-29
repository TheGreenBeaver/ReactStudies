import { arrayOf, string } from 'prop-types';
import React, { useCallback } from 'react';
// styling
import 'codemirror/theme/material.css';
import 'codemirror/addon/hint/show-hint.css';
// autocomplete
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/hint/xml-hint';
import 'codemirror/addon/hint/html-hint';
import 'codemirror/addon/hint/css-hint';
import 'codemirror/addon/hint/anyword-hint';
// brackets
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
// tags
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/matchtags';
// list
import 'codemirror/addon/edit/continuelist';
// lang modes
import 'codemirror/addon/mode/multiplex';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/jsx/jsx';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/htmlembedded/htmlembedded';
import 'codemirror/mode/css/css';
// highlighting
import 'codemirror/addon/search/match-highlighter';
// plugins
import remarkGfm from 'remark-gfm';
// rest
import MarkdownEditor from '@uiw/react-markdown-editor';
import InputLabel from '@mui/material/InputLabel';
import useColourMode from '../../../contexts/ColourMode';
import { SomeFile } from '../../../util/types';
import useEditableView from '../../../hooks/useEditableView';
import { uriTransformer as defaultUriTransformer } from 'react-markdown';


const LOCAL_PREFIX = 'local:';

function MarkdownField({ name, label, localFiles, localFilesRefs }) {
  const { setFieldValue, values, isEditing } = useEditableView();
  const value = values[name];
  const { mode } = useColourMode();

  function setValue(val) {
    setFieldValue(name, val);
  }

  const transformImageUri = useCallback(uri => {
    if (uri.startsWith(LOCAL_PREFIX) && localFiles && localFilesRefs) {
      const ref = uri.replace(LOCAL_PREFIX, '');
      const refIdx = localFilesRefs.indexOf(ref);
      if (refIdx !== -1) {
        const file = localFiles[refIdx];
        return file instanceof File ? URL.createObjectURL(file) : file.location;
      }
      return null;
    }
    return defaultUriTransformer(uri);
  }, [localFiles, localFilesRefs]);

  return (
    <>
      {!!label && <InputLabel sx={{ mb: 0.5 }}>{label}</InputLabel>}
      <div data-color-mode={mode}>
        <MarkdownEditor
          value={value}
          height={500}
          visible={isEditing ? undefined : true}
          visibleEditor={isEditing ? undefined : false}
          toolbarsMode={isEditing ? ['preview'] : []}
          onChange={(i, d, newValue) => setValue(newValue)}
          options={{
            autoCloseBrackets: {
              override: true,
              pairs: '()[]{}\'\'""<>``**__'
            },
            multiplexingMode: ['markdown', {
              mode: 'javascript',
              open: '\n```js\n',
              close: '\n```\n'
            }, {
              mode: 'html',
              open: '\n```html\n',
              close: '\n```\n'
            }],
            matchBrackets: true,
            autoCloseTags: true,
            matchTags: true,
            highlightSelectionMatches: { showToken: true },
            extraKeys: {
              Enter: 'newlineAndIndentContinueMarkdownList',
              'Ctrl-Space': 'autocomplete'
            }
          }}
          previewProps={{ remarkPlugins: [remarkGfm], transformImageUri }}
        />
      </div>
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