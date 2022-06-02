import { ReactComponent } from './React.svg';
import SvgIcon from '@mui/material/SvgIcon';
import { forwardRef } from 'react';


const ReactIcon = forwardRef((props, ref) =>
  <SvgIcon component={ReactComponent} {...props} ref={ref} inheritViewBox />
);

export default ReactIcon;