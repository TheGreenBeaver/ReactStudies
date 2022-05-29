import { bool, func, node, oneOfType, string } from 'prop-types';
import { useFormikContext } from 'formik';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { ArrowForwardIos } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import IconButton from '@mui/material/IconButton';


function SectionWrapper({ title, children, expanded, setExpanded }) {
  const formikContext = useFormikContext();
  const textTitle = typeof title === 'string' ? title : title(formikContext);
  return (
    <Accordion elevation={0} expanded={expanded}>
      <AccordionSummary
        sx={{
          cursor: 'default !important',
          px: 0,
          flexDirection: 'row-reverse',
          columnGap: 1,
          '&.Mui-expanded': {
            minHeight: 'unset'
          },
          '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
            transform: 'rotate(90deg)',
          },
          '& .MuiAccordionSummary-content.Mui-expanded': {
            my: 1.5
          }
        }}
        expandIcon={
          <IconButton onClick={() => setExpanded(curr => !curr)}>
            <ArrowForwardIos sx={{ fontSize: '0.9rem' }} />
          </IconButton>
        }
      >
        <Typography variant='h5'>{textTitle}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

SectionWrapper.propTypes = {
  title: oneOfType([string, func]).isRequired,
  children: node.isRequired,
  expanded: bool,
  setExpanded: func.isRequired
};

export default SectionWrapper;