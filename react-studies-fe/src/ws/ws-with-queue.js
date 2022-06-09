import { getCredentials } from '../util/auth';


class WsWithQueue extends WebSocket {
  static Actions = {
    taskRepositoryPopulated: 'taskRepositoryPopulated',
    solutionRepositoryPopulated: 'solutionRepositoryPopulated',
    workflowCompleted: 'workflowCompleted',
    workflowResultsReady: 'workflowResultsReady',
  };

  queue = null

  constructor(...args) {
    super(...args);

    this.addEventListener('open', () => {
      if (this.queue) {
        this.send(this.queue);
        this.queue = null;
      }
    });

    this.addEventListener('message', messageEvent => {
      const { action, payload } = JSON.parse(messageEvent.data);
      this.dispatchEvent(new CustomEvent(action, { detail: payload }));
    });
  }

  authorize() {
    const token = getCredentials();
    if (this.readyState !== this.OPEN) {
      this.queue = token;
      return;
    }
    this.send(token);
  }

  subscribe(actionName, handler) {
    const removableHandler = ({ detail }) => handler(detail);
    this.addEventListener(actionName, removableHandler);
    return () => this.removeEventListener(actionName, removableHandler);
  }
}

export default WsWithQueue;