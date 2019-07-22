const express = require('express');
const server = require('http').createServer();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Resolve storage path and create global config variable
const config = require('../config/config');
config.server.storagePath = path.resolve(config.server.storagePath);

// Freeze and store as global variable
global._config = Object.freeze(config);

// Create storage directory if not exists
if (!fs.existsSync(config.server.storagePath)) {
    fs.mkdirSync(config.server.storagePath);
}

// Create app
const app = express();

// Disable powered-by-message
app.disable('x-powered-by');

// Allow CORS
app.use(cors());

// GraphQL API Module
app.use('/api', require('./api/api'));

// Spawn Websocket
require('./websocket').launch(server);

// Add express http-server
server.on('request', app);
server.listen(config.server.port);
