import solutionsLinks from '../solutions/links';
import tasksLinks from '../tasks/links';
import authLinks from '../auth/links';
import { DEFAULT_PAGE_SIZE } from '../../util/constants';

const links = {
  solutions: solutionsLinks,
  tasks: tasksLinks,
  auth: authLinks,
};

function getDefaultPath({ isAuthorized, isVerified }) {
  if (!isAuthorized) {
    return links.auth.signIn.path;
  }

  if (!isVerified) {
    return links.auth.notVerified.path;
  }

  return links.tasks.taskList.compose({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
}

export default links;
export { getDefaultPath };
