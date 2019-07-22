const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Resolve storage path and create global config variable
const config = require('../../config/config');
config.server.storagePath = path.resolve(config.server.storagePath);

// Freeze and store as global variable
global._config = Object.freeze(config);

// Create storage directory if not exists
if (!fs.existsSync(config.server.storagePath)) {
    fs.mkdirSync(config.server.storagePath);
}

// Create app
const app = express();

// GraphQL API Module
app.use('/', require('../../src/api/api'));

module.exports = request(app);
