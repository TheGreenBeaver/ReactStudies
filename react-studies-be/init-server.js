const express = require('express');
const http = require('http');
const { PORT, DISPLAY_SOLUTIONS_PATH, SOLUTIONS_DIR, MEDIA_PATH, MEDIA_DIR } = require('./settings');
const applyGeneralMw = require('./middleware/general');
const applyErrorsMw = require('./middleware/errors');
const applyRouting = require('./routing');
const { getHost } = require('./util/misc');


const app = express();
const httpServer = http.createServer(app);

applyGeneralMw(app);

applyRouting(app);
app.use(DISPLAY_SOLUTIONS_PATH, express.static(SOLUTIONS_DIR));
app.use(MEDIA_PATH, express.static(MEDIA_DIR));

applyErrorsMw(app);

function runServer() {
  httpServer.listen(PORT, () => console.log(`Server is running on ${getHost()}`));
}

module.exports = runServer;
