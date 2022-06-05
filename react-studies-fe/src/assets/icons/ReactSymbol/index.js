import { ReactComponent } from './React.svg';
import SvgIcon from '@mui/material/SvgIcon';
import { forwardRef } from 'react';


const ReactSymbol = forwardRef((props, ref) =>
  <SvgIcon component={ReactComponent} {...props} ref={ref} inheritViewBox />
);

export default ReactSymbol;