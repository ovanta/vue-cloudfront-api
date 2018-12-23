const express = require('express');
const api = express.Router();

// Bind handler
const addMark = require('../actions/addMark.js');
const changeColor = require('../actions/changeColor.js');
const checkApiKey = require('../actions/checkApiKey.js');
const copy = require('../actions/copy.js');
const createFolder = require('../actions/createFolder.js');
const del = require('../actions/delete.js');
const download = require('../actions/download.js');
const login = require('../actions/login.js');
const move = require('../actions/move.js');
const register = require('../actions/register.js');
const removeMark = require('../actions/removeMark.js');
const rename = require('../actions/rename.js');
const update = require('../actions/update.js');
const upload = require('../actions/upload.js');

const mapHandler = mod => {
    return async (req, res) => {
        const response = await mod(req).then(res => {
            return {data: res, error: null};
        }).catch(reason => {
            return {data: {}, error: reason};
        });

        // console.log(file, error, data);
        res.send(response);
    };
};

api.post('/addMark', mapHandler(addMark));
api.post('/changeColor', mapHandler(changeColor));
api.post('/checkApiKey', mapHandler(checkApiKey));
api.post('/copy', mapHandler(copy));
api.post('/createFolder', mapHandler(createFolder));
api.post('/delete', mapHandler(del));
api.post('/login', mapHandler(login));
api.post('/move', mapHandler(move));
api.post('/register', mapHandler(register));
api.post('/removeMark', mapHandler(removeMark));
api.post('/rename', mapHandler(rename));
api.post('/update', mapHandler(update));
api.post('/upload', mapHandler(upload));

api.get('/download', download);

module.exports = api;
