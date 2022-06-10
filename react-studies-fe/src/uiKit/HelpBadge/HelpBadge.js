import { node, string } from 'prop-types';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';


function HelpBadge({ children, helpText }) {
  return (
    <Badge
      badgeContent={
        <Tooltip placement='top-start' title={helpText}>
          <Typography variant='body2' sx={{ cursor: 'help' }}>?</Typography>
        </Tooltip>
      }
      sx={{ '& .MuiBadge-badge': { pl: 3 }, display: 'block', width: 'fit-content' }}
    >
      {children}
    </Badge>
  );
}

HelpBadge.propTypes = {
  children: node.isRequired,
  helpText: string.isRequired
};

export default HelpBadge;