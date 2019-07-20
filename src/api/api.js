const uploadMiddleware = require('./endpoints/data/upload/middleware');
const json = require('./middleware/json');
const auth = require('./middleware/auth');
const path = require('path');
const fs = require('fs');

const express = require('express');
const api = express.Router();

// Load endpoints dynamically
const progBase = path.resolve('./src/api/endpoints');
for (const group of ['nodes', 'user', 'settings']) {
    const groupPath = path.join(progBase, group);

    // Resolve modules in this group
    for (const name of  fs.readdirSync(groupPath)) {
        const loc = `/${path.basename(name, '.js')}`;
        const module = require(path.join(groupPath, name));

        api.post(loc, json, auth, serializeResponseOf(module));
    }
}

// Special user endpoints
const register = require('./endpoints/auth/register');
const login = require('./endpoints/auth/login');

api.post('/register', json, serializeResponseOf(register));
api.post('/login', json, serializeResponseOf(login));

// Special data endpoints
const download = require('./endpoints/data/download');
const statics = require('./endpoints/data/static');
const upload = require('./endpoints/data/upload/upload');

api.post('/upload', uploadMiddleware, serializeResponseOf(upload));
api.get('/s/*', auth, statics);
api.get('/d/:id', download);

function serializeResponseOf(mod) {
    return async (req, res) => {

        // Execute async handler and serialize response
        const response = await mod(req, res).then(res => {
            return {data: res, error: null};
        }).catch(reason => {
            return {data: null, error: reason};
        });

        // Check if handler didn't send any response
        if (!res.headerSent) {
            res.send(response);
        }
    }
}

module.exports = api;
