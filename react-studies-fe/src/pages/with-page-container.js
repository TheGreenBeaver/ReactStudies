import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';


function withPageContainer(Component, narrow) {
  return props => (
    <Container component='main' maxWidth={narrow ? 'xs' : 'lg'} sx={{ minHeight: '100vh' }}>
      <Box
        sx={theme => {
          const { toolbar } = theme.mixins;
          const extraSpacing = parseInt(theme.spacing(narrow ? 8 : 2));
          const matchToolbar = Object.entries(toolbar).reduce((result, [propName, propVal]) => {
            if (typeof propVal === 'number') {
              return { ...result, paddingTop: `${propVal + extraSpacing}px` };
            }
            const adjustedPropName = propName.includes('min-width:0px')
              ? `${propName} and (max-width:${theme.breakpoints.values.sm - 1}px)`
              : propName;
            return { ...result, [adjustedPropName]: { paddingTop: `${propVal.minHeight + extraSpacing}px` } };
          }, {});

          if (!narrow) {
            return matchToolbar;
          }
          return { ...matchToolbar, display: 'flex', flexDirection: 'column', alignItems: 'center' };
        }}
      >
        <Component {...props} />
      </Box>
    </Container>
  );
}

export default withPageContainer;