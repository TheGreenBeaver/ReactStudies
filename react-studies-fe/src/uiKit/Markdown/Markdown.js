// styling
import 'codemirror/theme/material.css';
import 'codemirror/addon/hint/show-hint.css';
import './Markdown.styles.css';
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
// props
import { string, arrayOf, bool, func } from 'prop-types';
import { SomeFile } from '../../util/types';
// components
import ReactMarkdown, { uriTransformer as defaultUriTransformer } from 'react-markdown'
import MarkdownEditor from '@uiw/react-markdown-editor';
// rest
import { useCallback } from 'react';
import { getBaseAndExt } from '../../util/misc';
import useColourMode from '../../contexts/ColourMode';


const LOCAL_PREFIX = './attachments/'

function Markdown({ isEditing, localFiles, localFilesRefs, source, setValue }) {
  const { mode } = useColourMode();

  const transformImageUri = useCallback(uri => {
    if (uri.startsWith(LOCAL_PREFIX) && localFiles && localFilesRefs) {
      const ref = uri.replace(LOCAL_PREFIX, '');
      const [base, ext] = getBaseAndExt(ref);
      const refIdx = localFilesRefs.indexOf(base);
      if (refIdx !== -1) {
        const file = localFiles[refIdx];
        if (getBaseAndExt(file)[1] === ext) {
          return file instanceof File ? URL.createObjectURL(file) : file.location;
        }
      }
      return null;
    }
    return defaultUriTransformer(uri);
  }, [localFiles, localFilesRefs]);

  return (
    <div data-color-mode={mode}>
      {isEditing ? (
        <MarkdownEditor
          value={source}
          height={500}
          toolbarsMode={['preview']}
          onChange={(i, d, newValue) => setValue(newValue)}
          options={{
            autoCloseBrackets: {
              override: true,
              pairs: '()[]{}\'\'""<>``**__',
            },
            multiplexingMode: ['markdown', {
              mode: 'javascript',
              open: '\n```js\n',
              close: '\n```\n',
            }, {
              mode: 'html',
              open: '\n```html\n',
              close: '\n```\n',
            }, {
              mode: 'css',
              open: '\n```css\n',
              close: '\n```\n',
            }],
            matchBrackets: true,
            autoCloseTags: true,
            matchTags: true,
            highlightSelectionMatches: { showToken: true },
            extraKeys: {
              Enter: 'newlineAndIndentContinueMarkdownList',
              'Ctrl-Space': 'autocomplete',
            },
          }}
          previewProps={{ remarkPlugins: [remarkGfm], transformImageUri }}
        />
      ) : (
        <ReactMarkdown
          className='md-editor wmde-markdown fs-markdown_preview--view-mode'
          remarkPlugins={[remarkGfm]}
          transformImageUri={transformImageUri}
        >
          {source}
        </ReactMarkdown>
      )}
    </div>

  );
}

Markdown.propTypes = {
  localFiles: arrayOf(SomeFile),
  localFilesRefs: arrayOf(string),
  isEditing: bool,
  source: string.isRequired,
  setValue: func,
};

export default Markdown;