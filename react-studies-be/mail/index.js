const { isDev } = require('../util/env');

async function sendMail(content, email) {
  if (isDev) {
    console.log(content);
    return Promise.resolve();
  }

  // TODO: send real mail
}

module.exports = sendMail;