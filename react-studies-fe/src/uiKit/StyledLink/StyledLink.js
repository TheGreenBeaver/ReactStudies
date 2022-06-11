import { node, oneOfType, shape, string } from 'prop-types';
import StyleProvider from '@mui/material/Link';
import { Link } from 'react-router-dom';


function StyledLink({ to, children, ...otherProps }) {
  return (
    <StyleProvider
      component={Link}
      to={typeof to === 'string' ? to : to.path}
      rel={null}
      target={null}
      {...otherProps}
    >
      {children}
    </StyleProvider>
  );
}

StyledLink.propTypes = {
  to: oneOfType([string, shape({ path: string.isRequired })]).isRequired,
  children: node.isRequired,
};

export default StyledLink;