const express = require('express');
const cors = require('cors');
const compression = require('compression');
const bodyParser = require('body-parser');
const api = require('./api/api');
const config = require('../config/config');

// Create app
const app = express();

// Disable powered-by-message
app.disable('x-powered-by');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// G-Zip compression
app.use(compression());

// Allow CORS
app.use(cors());

// GraphQL API Module
app.use('/api', api);

// Start
app.listen(config.server.port);
