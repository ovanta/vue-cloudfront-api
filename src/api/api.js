const fs = require('fs');
const express = require('express');
const api = express.Router();

// Bind handler
const basePath = `${__dirname}/../actions`;
fs.readdirSync(basePath).forEach(file => {
    api.post(`/${file.match(/^[^.]+/)}`, async (req, res) => {

        const response = await require(`${basePath}/${file}`)(req).then(res => {
            return {data: res, error: null};
        }).catch(reason => {
            return {data: {}, error: reason};
        });

        // console.log(file, error, data);
        res.send(response);
    });
});

module.exports = api;
