import { ReactComponent } from './SolutionIdea.svg';
import SvgIcon from '@mui/material/SvgIcon';
import { forwardRef } from 'react';


const SolutionIdea = forwardRef((props, ref) =>
  <SvgIcon component={ReactComponent} {...props} ref={ref} inheritViewBox />
);

export default SolutionIdea;