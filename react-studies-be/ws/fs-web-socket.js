const { WebSocket } = require('ws');
const { authorize } = require('../util/user-identity');


class FsWebSocket extends WebSocket {
  /**
   *
   * @type {User}
   */
  user = null;

  constructor(...args) {
    super(...args);
    this.on('message', async token => {
      if (!/[0-9abcdef]{40}/.test(token)) {
        return this.send('WebSocket authorization failed');
      }

      try {
        const authToken = await authorize(`${token}`);
        if (authToken?.user) {
          this.user = authToken.user;
        }
      } catch {
        this.send('WebSocket authorization failed');
      }
    });
  }

  async sendMessage(action, payload, onError = () => {}) {
    try {
      const toSend = JSON.stringify({ action, payload });
      await new Promise((resolve, reject) => this.send(
        toSend, {}, err => err ? reject(err) : resolve(),
      ));
    } catch (err) {
      onError(err);
    }
  }

  get isAuthorized() {
    return !!this.user;
  }

  /**
   *
   * @param {number | User} otherUser
   * @return {boolean}
   */
  userIs(otherUser) {
    return this.isAuthorized && this.user.id === (typeof otherUser === 'number' ? otherUser : otherUser.id);
  }
}

module.exports = FsWebSocket;
