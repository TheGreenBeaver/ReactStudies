import React from 'react';
import { string, node } from 'prop-types';
import StyleProvider from '@mui/material/Link';
import { Link } from 'react-router-dom';

function StyledLink({ to, children, ...otherProps }) {
  return (
    <StyleProvider
      component={Link}
      to={to}
      {...otherProps}
    >
      {children}
    </StyleProvider>
  );
}

StyledLink.propTypes = {
  to: string.isRequired,
  children: node.isRequired
};

export default StyledLink;