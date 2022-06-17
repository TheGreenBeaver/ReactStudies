import FatalErrorWrapper from './FatalErrorWrapper';
import { node } from 'prop-types';


function Wrappers({ children }) {
  return (
    <FatalErrorWrapper>
      {children}
    </FatalErrorWrapper>
  );
}

Wrappers.propTypes = {
  children: node.isRequired,
};

export default Wrappers;