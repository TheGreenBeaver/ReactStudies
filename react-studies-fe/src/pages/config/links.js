import tasksLinks from '../tasks/links';
import authLinks from '../auth/links';
const links = {
  tasks: tasksLinks,
  auth: authLinks,
};

function getDefaultPath(state) {
  return '/';
}

export default links;
export { getDefaultPath };
