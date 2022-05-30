import tasksLinks from '../tasks/links';
import authLinks from '../auth/links';

const links = {
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

  return links.tasks.taskList.compose({ page: 1 });
}

export default links;
export { getDefaultPath };
