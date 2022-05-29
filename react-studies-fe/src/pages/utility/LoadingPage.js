import Layout from '../../uiKit/Layout';
import Preloader from '../../uiKit/Preloader';


function LoadingPage() {
  return (
    <Layout.Center height='100vh' width='100vw'>
      <Preloader size={100} />
    </Layout.Center>
  );
}

export default LoadingPage;