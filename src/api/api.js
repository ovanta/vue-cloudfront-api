const fs = require('fs');
const express = require('express');
const api = express.Router();

// Bind handler
const basePath = `${__dirname}/../actions`;
fs.readdirSync(basePath).forEach(file => {
    api.post(`/${file.match(/^[^.]+/)}`, async (req, res) => {
        let error, data;

        try {
            data = await require(`${basePath}/${file}`)(req);
        } catch (e) {
            error = e;
        }

        // console.log(file, error, data);
        res.send({error, data});
    });
});

module.exports = api;
