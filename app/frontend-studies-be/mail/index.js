const { isDev, getVar } = require('../util/env');
const nodemailer = require('nodemailer');

let transporter;
if (!isDev) {
  const user = getVar('EMAIL_USER');
  const pass = getVar('EMAIL_PASS');
  const host = getVar('EMAIL_HOST');
  const port = parseInt(getVar('EMAIL_PORT'));

  transporter = nodemailer.createTransport(
    { host, port, secure: port === 465, auth: { user, pass } },
    { from: user }
  );
}


async function sendMail(content, receiver) {
  if (isDev) {
    return console.log(`TO: ${receiver}\nCONTENT: ${JSON.stringify(content)}`)
  }

  const message = {
    to: receiver,
    ...content
  };
  return transporter.sendMail(message);
}

module.exports = sendMail;
