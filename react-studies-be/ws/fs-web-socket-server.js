const { WebSocketServer, OPEN } = require('ws');
const FsWebSocket = require('./fs-web-socket');
const { WS_PATH } = require('../settings');


class FsWebSocketServer extends WebSocketServer {
  Actions = {
    taskRepositoryPopulated: 'taskRepositoryPopulated',
    solutionRepositoryPopulated: 'solutionRepositoryPopulated',
    workflowCompleted: 'workflowCompleted',
    workflowResultsReady: 'workflowResultsReady',
  };

  constructor() {
    super({
      clientTracking: true,
      noServer: true,
      WebSocket: FsWebSocket,
      path: WS_PATH
    });
  }

  /**
   *
   * @return {FsWebSocket[]}
   */
  get openClients() {
    return [...this.clients].filter(client => client.readyState === OPEN);
  }

  /**
   *
   * @param {User | number} user
   * @param {string} action
   * @param {Object} payload
   * @return {Promise<void>}
   */
  async sendToUser(user, action, payload) {
    const client = this.openClients.find(c => c.userIs(user));
    if (client) {
      return client.sendMessage(action, payload);
    }
  }

  logUserOut(user) {
    const client = this.openClients.find(c => c.userIs(user));
    if (client) {
      client.logOut();
    }
  }

  /**
   *
   * @param {string} action
   * @param {Object | function(client: FsWebSocket): Object | Promise<Object>} payload
   * @param {(function(client: FsWebSocket): boolean | Promise<boolean>)=} shouldSendToClient
   * @return {Promise<boolean>} - `true` if managed to send to all required clients
   */
  async broadcast(action, payload, shouldSendToClient = () => true) {
    const sendResults = [];
    for (const client of this.openClients) {
      const shouldSend = await shouldSendToClient(client);
      if (shouldSend) {
        const _payload = typeof payload === 'function' ? await payload(client) : payload;
        const idx = sendResults.length;
        sendResults.push(true);
        await client.sendMessage(action, _payload, () => sendResults[idx] = false);
      }
    }
    return sendResults.every(Boolean);
  }
}

module.exports = FsWebSocketServer;
