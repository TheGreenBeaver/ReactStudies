const { WebSocketServer, OPEN } = require('ws');
const RsWebSocket = require('./rs-web-socket');
const { WS_PATH } = require('../settings');


class RsWebSocketServer extends WebSocketServer {
  constructor() {
    super({
      clientTracking: true,
      noServer: true,
      WebSocket: RsWebSocket,
      path: WS_PATH
    });
  }

  /**
   *
   * @return {RsWebSocket[]}
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
    return client.sendMessage(action, payload);
  }

  /**
   *
   * @param {string} action
   * @param {Object | function(client: RsWebSocket): Object | Promise<Object>} payload
   * @param {(function(client: RsWebSocket): boolean | Promise<boolean>)=} shouldSendToClient
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

module.exports = RsWebSocketServer;
