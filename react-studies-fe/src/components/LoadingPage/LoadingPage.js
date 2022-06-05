import Layout from '../../uiKit/Layout';
import Preloader from '../../uiKit/Preloader';
import { bool } from 'prop-types';


function LoadingPage({ fullScreen }) {
  const props = fullScreen ? { height: '100vh' } : { flex: 1 };
  return (
    <Layout.Center width='100vw' {...props}>
      <Preloader size={100} />
    </Layout.Center>
  );
}

LoadingPage.propTypes = {
  fullScreen: bool,
};

export default LoadingPage;