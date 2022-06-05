const SMTPServer = require("smtp-server").SMTPServer;
const server = new SMTPServer({
  allowInsecureAuth: true,
  authOptional: true,

  onConnect: (session, callback) => {
    console.log({
      what: 'connect',
      session
    });
    return callback();
  },
  onAuth: (auth, session, callback) => {
    console.log({
      what: 'auth',
      auth, session
    });
    return callback();
  },
  onMailFrom: (address, session, callback) => {
    console.log({
      what: 'mailFrom',
      address, session
    })
    return callback();
  },
  onRcptTo: (address, session, callback) => {
    console.log({
      what: 'rcptTo',
      address, session
    });
    return callback();
  },
  onData: (stream, session, callback) => {
    console.log({
      what: 'data',
      session
    })
    stream.pipe(process.stdout);
    stream.on('end', callback);
  },
  onClose: (...args) => console.log({
    what: 'close',
    args
  })
});

server.on('error', err => {
  console.log("Error %s", err.message);
});

process.on('SIGINT', () => server.close((...args) => console.log({
  what: 'closed',
  args
})));

server.listen(5050, (...args) => console.log({
  what: 'listening',
  args
}));
