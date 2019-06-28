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
        return {data: null, error: reason};
    });

    if (!res.headerSent) {
        res.send(response);
    }
};

// === Nodes endpoints
const addMark = require('./endpoints/nodes/addMark');
const changeColor = require('./endpoints/nodes/changeColor');
const checkApiKey = require('./endpoints/user/checkApiKey');
const copy = require('./endpoints/nodes/copy');
const createFolder = require('./endpoints/nodes/createFolder');
const createFolders = require('./endpoints/nodes/createFolders');
const move = require('./endpoints/nodes/move');
const removeMark = require('./endpoints/nodes/removeMark');
const rename = require('./endpoints/nodes/rename');
const update = require('./endpoints/nodes/update');
const addStaticId = require('./endpoints/nodes/addStaticId');
const removeStaticId = require('./endpoints/nodes/removeStaticId');
const moveToBin = require('./endpoints/nodes/moveToBin');
const restoreFromBin = require('./endpoints/nodes/restoreFromBin');
const zip = require('./endpoints/nodes/zip');

// === User endpoints
const login = require('./endpoints/user/login');
const logout = require('./endpoints/user/logout');
const logoutEverywhere = require('./endpoints/user/logoutEverywhere');
const register = require('./endpoints/user/register');
const updateCredentials = require('./endpoints/user/updateCredentials');
const deleteAccount = require('./endpoints/user/deleteAccount');
const status = require('./endpoints/user/status');

// === Data endpoints
const download = require('./endpoints/data/download');
const statics = require('./endpoints/data/static');
const upload = require('./endpoints/data/upload/upload');
const del = require('./endpoints/data/delete');

// === Events endpoints
const settings = require('./endpoints/settings/settings');
const updateSettings = require('./endpoints/settings/updateSettings');

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
api.post('/zip', json, mapHandler(zip));

api.post('/delete', json, mapHandler(del));
api.post('/upload', uploadMiddleware, mapHandler(upload));
api.get('/s/*', statics);
api.get('/d/:id', download);

api.post('/login', json, mapHandler(login));
api.post('/logoutEverywhere', json, mapHandler(logoutEverywhere));
api.post('/logout', json, mapHandler(logout));
api.post('/register', json, mapHandler(register));
api.post('/updateCredentials', json, mapHandler(updateCredentials));
api.post('/deleteAccount', json, mapHandler(deleteAccount));
api.post('/status', json, mapHandler(status));

api.post('/updateSettings', json, mapHandler(updateSettings));
api.post('/settings', json, mapHandler(settings));

module.exports = api;
