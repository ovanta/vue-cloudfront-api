const express = require('express');
const api = express.Router();

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

const download = require('../endpoints/data/download.js');
const upload = require('../endpoints/data/upload.js');
const del = require('../endpoints/data/delete.js');

const mapHandler = mod => {
    return async (req, res) => {
        const response = await mod(req).then(res => {
            return {data: res, error: null};
        }).catch(reason => {
            return {data: null, error: reason};
        });

        res.send(response);
    };
};

api.post('/addMark', mapHandler(addMark));
api.post('/changeColor', mapHandler(changeColor));
api.post('/checkApiKey', mapHandler(checkApiKey));
api.post('/copy', mapHandler(copy));
api.post('/createFolder', mapHandler(createFolder));
api.post('/move', mapHandler(move));
api.post('/removeMark', mapHandler(removeMark));
api.post('/rename', mapHandler(rename));
api.post('/update', mapHandler(update));

api.post('/login', mapHandler(login));
api.post('/register', mapHandler(register));
api.post('/settings', mapHandler(settings));

api.post('/delete', mapHandler(del));
api.post('/upload', mapHandler(upload));
api.get('/download', download);

module.exports = api;
