const RsWebSocketServer = require('./rs-web-socket-server');


function apply(httpServer, expressApp) {
  const wsServer = new RsWebSocketServer();
  httpServer.on('upgrade', (req, socket, head) =>
    wsServer.handleUpgrade(req, socket, head, ws => wsServer.emit('connection', ws, req))
  );
  expressApp.locals.wsServer = wsServer;
}

module.exports = apply;
