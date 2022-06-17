import AppLink from '../config/AppLink';

const links = {
  solutionsList: new AppLink('/solutions'),
  singleSolution: new AppLink('/solutions/:id(\\d+)'),
};

export default links;
