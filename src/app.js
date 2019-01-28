const compression = require('compression');
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

// Resolve storage path and create global config variable
const config = require('../config/config');
config.server.storagePath = path.resolve(`./${config.server.storagePath}`);

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

// G-Zip compression
app.use(compression());

// Allow CORS
app.use(cors());

// GraphQL API Module
app.use('/api', require('./api/api'));

// Start
app.listen(config.server.port);
