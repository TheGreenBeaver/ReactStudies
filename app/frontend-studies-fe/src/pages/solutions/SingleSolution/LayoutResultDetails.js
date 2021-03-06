import { object } from 'prop-types';
import Typography from '@mui/material/Typography';
import MuiLink from '@mui/material/Link';
import Box from '@mui/material/Box';


function LayoutResultDetails({
  result: {
    layoutResult: {
      diffLocation, reportLocation, rawSizingUsage, absPosUsage,
    },
  },
}) {
  return (
    <>
      {absPosUsage != null && <Typography><code>position: absolute</code> usage: {absPosUsage}%</Typography>}
      {rawSizingUsage != null && <Typography>Raw <code>px</code> sizing usage: {rawSizingUsage}%</Typography>}
      <MuiLink href={reportLocation}>View full report</MuiLink>
      {diffLocation && (
        <Box width='100%' maxWidth='100%'>
          <Typography mb={0.5}>Difference with mockup</Typography>
          <Box width='100%' maxWidth='100%' overflow='auto'>
            <img src={diffLocation} alt='diff' />
          </Box>
        </Box>
      )}
    </>
  );
}

LayoutResultDetails.propTypes = {
  result: object.isRequired
};

export default LayoutResultDetails;