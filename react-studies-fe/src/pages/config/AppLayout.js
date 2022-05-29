import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { bool, node } from 'prop-types';
import { memo } from 'react';


function AppLayout({ children, narrow }) {
  return (
    <Container component='main' maxWidth={narrow ? 'xs' : 'lg'} sx={{ minHeight: '100vh' }}>
      <Box
        sx={theme => {
          const { toolbar } = theme.mixins;
          const extraSpacing = parseInt(theme.spacing(narrow ? 8 : 2));
          return Object.entries(toolbar).reduce((result, [propName, propVal]) => {
            if (typeof propVal === 'number') {
              return { ...result, paddingTop: `${propVal + extraSpacing}px` };
            }
            const adjustedPropName = propName.includes('min-width:0px')
              ? `${propName} and (max-width:${theme.breakpoints.values.sm - 1}px)`
              : propName;
            return { ...result, [adjustedPropName]: { paddingTop: `${propVal.minHeight + extraSpacing}px` } };
          }, {});
        }}
        pb={8}
        display='flex'
        alignItems={narrow ? 'center' : 'stretch'}
        flexDirection='column'
        minHeight='100vh'
      >
        {children}
      </Box>
    </Container>
  )
}

AppLayout.propTypes = {
  children: node.isRequired,
  narrow: bool.isRequired
};

export default memo(AppLayout);
