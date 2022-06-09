import Layout from '../../uiKit/Layout';
import Preloader from '../../uiKit/Preloader';
import { bool } from 'prop-types';


function LoadingPage({ fullScreen }) {
  const props = fullScreen ? { height: '100vh', width: '100vw' } : { flex: 1, width: '100%' };
  return (
    <Layout.Center {...props}>
      <Preloader size={100} />
    </Layout.Center>
  );
}

LoadingPage.propTypes = {
  fullScreen: bool,
};

export default LoadingPage;