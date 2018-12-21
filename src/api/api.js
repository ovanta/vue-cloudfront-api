const fs = require('fs');
const express = require('express');
const api = express.Router();

// Bind handler
const basePath = `${__dirname}/../actions`;
fs.readdirSync(basePath).forEach(file => {
    api.get(`/${file.match(/^[^.]+/)}`, require(`${basePath}/${file}`));
});

module.exports = api;
