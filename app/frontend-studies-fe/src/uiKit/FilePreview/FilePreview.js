import { Ratio, SomeFile, StyleProp } from '../../util/types';
import { getTribeFromMime } from '../../util/misc';
import { FILE_TRIBES, STANDARD_RATIO } from '../../util/constants';
import AutosizeMedia from '../AutosizeMedia';
import last from 'lodash/last';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Article from '@mui/icons-material/Article';
import Clear from '@mui/icons-material/Clear';
import HelpCenter from '@mui/icons-material/HelpCenter';
import SnippetFolder from '@mui/icons-material/SnippetFolder';
import Terminal from '@mui/icons-material/Terminal';
import Layout from '../Layout';
import { func } from 'prop-types';
import IconButton from '@mui/material/IconButton';
import { useMemo } from 'react';


const ICONS = {
  [FILE_TRIBES.doc]: <Article />,
  [FILE_TRIBES.pack]: <SnippetFolder />,
  [FILE_TRIBES.snippet]: <Terminal />,
  [FILE_TRIBES.unknown]: <HelpCenter />
};

function FilePreview({ file, ratio, width, onRemove }) {
  const { tribe, source, originalName } = useMemo(() => {
    const isFresh = file instanceof File;
    const mime = isFresh ? file.type : file.mime;
    const source = isFresh ? URL.createObjectURL(file) : file.location;
    const originalName = isFresh ? file.name : last(file.location.split(/(?<!\\)\//));
    const tribe = getTribeFromMime(mime);
    return { tribe, source, originalName };
  }, [file]);

  function getContent() {
    switch (tribe) {
      case FILE_TRIBES.image:
        return <AutosizeMedia src={source} mediaType={AutosizeMedia.MEDIA_TYPES.image} ratio={ratio} alt='preview' />;
      case FILE_TRIBES.video:
        return <AutosizeMedia controls src={source} mediaType={AutosizeMedia.MEDIA_TYPES.video} ratio={ratio} />
      case FILE_TRIBES.audio:
        return (
          <Box p={2}>
            <audio src={source} controls />
            <Typography variant='caption' mt={0.5}>{originalName}</Typography>
          </Box>
        );
      default:
        return (
          <Box
            display='flex'
            alignItems='end'
            columnGap={0.5}
            component='a'
            target='_blank'
            rel='noopener noreferrer'
            href={source}
          >
            {ICONS[tribe]}
            <Typography variant='caption'>{originalName}</Typography>
          </Box>
        );
    }
  }

  return (
    <Box width={width} position='relative'>
      {
        onRemove &&
        <IconButton
          sx={{
            position: 'absolute',
            zIndex: 10,
            right: theme => `-${theme.spacing(0.5)}`,
            top: theme => `-${theme.spacing(0.5)}`,
          }}
          onClick={onRemove}
        >
          <Clear />
        </IconButton>
      }
      <Layout.Ratio ratio={ratio} width={100}>
        <Layout.Center>
          {getContent()}
        </Layout.Center>
      </Layout.Ratio>
    </Box>
  )
}

FilePreview.propTypes = {
  file: SomeFile.isRequired,
  ratio: Ratio,
  width: StyleProp.isRequired,
  onRemove: func
};

FilePreview.defaultProps = {
  ratio: STANDARD_RATIO,
};

export default FilePreview;