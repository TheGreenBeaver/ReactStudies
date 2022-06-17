import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { bool, node, func, elementType, object } from 'prop-types';
import IconButton from '@mui/material/IconButton';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import { useState } from 'react';


function StrictAccordion({
  summary,
  children,
  isExpanded: externalIsExpanded,
  setIsExpanded: setExternalIsExpanded,
  ExpandIcon,
  sx,
  rotateIcon
}) {
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);
  const setIsExpanded = setExternalIsExpanded || setInternalIsExpanded;
  const isExpanded = externalIsExpanded != null ? externalIsExpanded : internalIsExpanded;
  return (
    <Accordion elevation={0} expanded={isExpanded} sx={sx}>
      <AccordionSummary
        sx={{
          cursor: 'default !important',
          px: 0,
          flexDirection: 'row-reverse',
          columnGap: 1,
          '&.Mui-expanded': {
            minHeight: 'unset'
          },
          '& .MuiAccordionSummary-content.Mui-expanded': {
            my: 1.5
          },
          '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
            transform: rotateIcon ? 'rotate(90deg)' : 'none',
          }
        }}
        expandIcon={
          <IconButton onClick={() => setIsExpanded(curr => !curr)}>
            <ExpandIcon sx={{ fontSize: '0.9rem' }} />
          </IconButton>
        }
      >
        {summary}
      </AccordionSummary>
      <AccordionDetails>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

StrictAccordion.propTypes = {
  summary: node.isRequired,
  children: node.isRequired,
  isExpanded: bool,
  setIsExpanded: func,
  ExpandIcon: elementType,
  sx: object,
  rotateIcon: bool
};

StrictAccordion.defaultProps = {
  ExpandIcon: ArrowForwardIos,
};

export default StrictAccordion;