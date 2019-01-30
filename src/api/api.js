const express = require('express');
const api = express.Router();

// JSON Middleware
const bodyParser = require('body-parser');
const json = bodyParser.json({limit: '50mb'});

// multipart/formdata middleware
const uploadMiddleware = require('./endpoints/data/upload/uploadMiddleware');

const mapHandler = mod => async (req, res) => {
    const response = await mod(req, res).then(res => {
        return {data: res, error: null};
    }).catch(reason => {

        if (typeof reason !== 'string') {
            console.warn('Suspicious error', reason); // eslint-disable-line no-console
            reason = 'Internal error.';
        }

        return {data: null, error: reason};
    });

    if (!res.headerSent) {
        res.send(response);
    }
};

// === Nodes endpoints
const addMark = require('./endpoints/nodes/addMark.js');
const changeColor = require('./endpoints/nodes/changeColor.js');
const checkApiKey = require('./endpoints/user/checkApiKey.js');
const copy = require('./endpoints/nodes/copy.js');
const createFolder = require('./endpoints/nodes/createFolder.js');
const createFolders = require('./endpoints/nodes/createFolders.js');
const move = require('./endpoints/nodes/move.js');
const removeMark = require('./endpoints/nodes/removeMark.js');
const rename = require('./endpoints/nodes/rename.js');
const update = require('./endpoints/nodes/update.js');
const addStaticId = require('./endpoints/nodes/addStaticId.js');
const removeStaticId = require('./endpoints/nodes/removeStaticId.js');
const moveToBin = require('./endpoints/nodes/moveToBin.js');
const restoreFromBin = require('./endpoints/nodes/restoreFromBin.js');

// === User endpoints
const login = require('./endpoints/user/login.js');
const register = require('./endpoints/user/register.js');
const updateCredentials = require('./endpoints/user/updateCredentials.js');
const deleteAccount = require('./endpoints/user/deleteAccount.js');

// === Data endpoints
const download = require('./endpoints/data/download.js');
const statics = require('./endpoints/data/static.js');
const upload = require('./endpoints/data/upload/upload.js');
const del = require('./endpoints/data/delete.js');

// === Events endpoints
const getStats = require('./endpoints/stats/getStats');
const updateStats = require('./endpoints/stats/updateStats');

api.post('/addMark', json, mapHandler(addMark));
api.post('/changeColor', json, mapHandler(changeColor));
api.post('/checkApiKey', json, mapHandler(checkApiKey));
api.post('/copy', json, mapHandler(copy));
api.post('/createFolder', json, mapHandler(createFolder));
api.post('/createFolders', json, mapHandler(createFolders));
api.post('/move', json, mapHandler(move));
api.post('/removeMark', json, mapHandler(removeMark));
api.post('/rename', json, mapHandler(rename));
api.post('/update', json, mapHandler(update));
api.post('/addStaticId', json, mapHandler(addStaticId));
api.post('/removeStaticId', json, mapHandler(removeStaticId));
api.post('/moveToBin', json, mapHandler(moveToBin));
api.post('/restoreFromBin', json, mapHandler(restoreFromBin));

api.post('/delete', json, mapHandler(del));
api.post('/upload', uploadMiddleware, mapHandler(upload));
api.get('/s/*', statics);
api.get('/d/:id', download);

api.post('/login', json, mapHandler(login));
api.post('/register', json, mapHandler(register));
api.post('/updateCredentials', json, mapHandler(updateCredentials));
api.post('/deleteAccount', json, mapHandler(deleteAccount));

api.post('/updateStats', json, mapHandler(updateStats));
api.post('/getStats', json, mapHandler(getStats));

module.exports = api;
