const express = require('express');
const http = require('http');
const applyGeneralMw = require('./middleware/general');
const applyErrorsMw = require('./middleware/errors');
const applyApi = require('./api');
const applyWebhooks = require('./webhooks');
const applyWs = require('./ws');
const { origin, port } = require('./util/env');


const app = express();
const httpServer = http.createServer(app);

applyGeneralMw(app);

applyWs(httpServer, app);
applyApi(app);
applyWebhooks(app);

applyErrorsMw(app);

function runServer() {
  httpServer.listen(port, () => console.log(`Server is running on ${origin}`));
}

module.exports = runServer;
