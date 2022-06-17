import { useFatalError } from '../store/selectors';
import Layout from '../uiKit/Layout';
import Typography from '@mui/material/Typography';
import { node } from 'prop-types';


function FatalErrorWrapper({ children }) {
  const fatalError = useFatalError();
  if (fatalError) {
    // TODO: Fatal Error Page
    return (
      <Layout.Center minHeight='100vh'>
        <Typography variant='h1'>ERROR: {fatalError.response.status}</Typography>
      </Layout.Center>
    );
  }

  return children;
}

FatalErrorWrapper.propTypes = {
  children: node.isRequired,
};

export default FatalErrorWrapper;