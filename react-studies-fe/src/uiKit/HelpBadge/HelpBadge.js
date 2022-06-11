import { node, object, string } from 'prop-types';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import HelpOutline from '@mui/icons-material/HelpOutline'


function HelpBadge({ children, helpText, sx }) {
  return (
    <Badge
      badgeContent={
        <Tooltip placement='top-start' title={helpText}>
          <HelpOutline sx={{ cursor: 'help', fontSize: '1.5em', color: 'text.secondary' }} />
        </Tooltip>
      }
      sx={{ '& .MuiBadge-badge': { pl: 3, ...sx }, display: 'block', width: 'fit-content' }}
    >
      {children}
    </Badge>
  );
}

HelpBadge.propTypes = {
  children: node.isRequired,
  helpText: string.isRequired,
  sx: object
};

export default HelpBadge;