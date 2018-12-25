const express = require('express');
const api = express.Router();
const bodyParser = require('body-parser');

const json = bodyParser.json({limit: '50mb'});

// Bind handler
const addMark = require('../endpoints/nodes/addMark.js');
const changeColor = require('../endpoints/nodes/changeColor.js');
const checkApiKey = require('../endpoints/nodes/checkApiKey.js');
const copy = require('../endpoints/nodes/copy.js');
const createFolder = require('../endpoints/nodes/createFolder.js');
const move = require('../endpoints/nodes/move.js');
const removeMark = require('../endpoints/nodes/removeMark.js');
const rename = require('../endpoints/nodes/rename.js');
const update = require('../endpoints/nodes/update.js');

const login = require('../endpoints/user/login.js');
const register = require('../endpoints/user/register.js');
const settings = require('../endpoints/user/settings.js');
const deleteAccount = require('../endpoints/user/deleteAccount.js');

const download = require('../endpoints/data/download.js');
const upload = require('../endpoints/data/upload.js');
const del = require('../endpoints/data/delete.js');

const mapHandler = mod => {
    return async (req, res) => {

        const response = await mod(req).then(res => {
            return {data: res, error: null};
        }).catch(reason => {

            if (typeof reason !== 'string') {
                /* eslint-disable no-console */
                console.warn('Suspicious error', reason);
                reason = 'Try again later please.';
            }

            return {data: null, error: reason};
        });

        res.send(response);
    };
};

api.post('/addMark', json, mapHandler(addMark));
api.post('/changeColor', json, mapHandler(changeColor));
api.post('/checkApiKey', json, mapHandler(checkApiKey));
api.post('/copy', json, mapHandler(copy));
api.post('/createFolder', json, mapHandler(createFolder));
api.post('/move', json, mapHandler(move));
api.post('/removeMark', json, mapHandler(removeMark));
api.post('/rename', json, mapHandler(rename));
api.post('/update', json, mapHandler(update));

api.post('/delete', json, mapHandler(del));
api.post('/upload', mapHandler(upload));
api.get('/download', download);

api.post('/login', json, mapHandler(login));
api.post('/register', json, mapHandler(register));
api.post('/settings', json, mapHandler(settings));
api.post('/deleteAccount', json, mapHandler(deleteAccount));

module.exports = api;
