const { WebSocket } = require('ws');


class FsWebSocket extends WebSocket {
  /**
   *
   * @type {User}
   */
  user = null;

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
