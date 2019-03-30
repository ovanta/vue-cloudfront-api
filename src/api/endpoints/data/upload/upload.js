const fs = require('fs');
const {pick} = require('../../../../utils');
const authViaApiKey = require('../../../tools/authViaApiKey');
const usedSpaceBy = require('../../../tools/usedSpaceBy');
const nodeModel = require('../../../../models/node');

module.exports = async req => {
    const {body, files} = req;

    // Authenticate user
    const user = await authViaApiKey(body.apikey).catch(reason => {

        // Delete files
        for (const {path} of files) {
            fs.unlink(path, () => 0);
        }

        throw reason;
    });

    const contentLength = Number(req.get('content-length'));

    // Validate header
    if (isNaN(contentLength)) {
        throw 'Invalid content-length header';
    }

    // Compare current storage size and upload size with limit
    const {totalStorageLimitPerUser} = _config.server;
    if (~totalStorageLimitPerUser && (await usedSpaceBy(user.id)) + contentLength > totalStorageLimitPerUser) {
        throw `Storage limit of ${totalStorageLimitPerUser} bytes exceed`;
    }

    // Rename files and create nodes
    const nodes = [];
    for (let i = 0, n = files.length; i < n; i++) {
        const {fieldname, filename, originalname, path, size} = files[i];

        /**
         * Beause fordata cannot have multiple values assigned to
         * one key, they're prefixed with a index: [HASH]-[INDEX]
         *
         * Extract the hash.
         */
        const parent = fieldname.substring(0, fieldname.indexOf('-'));
        if (!parent) {
            fs.unlinkSync(path);
            throw 'Invalid node key';
        }

        // Check if destination exists and is a folder
        const destNode = await nodeModel.findOne({owner: user.id, id: parent}).exec();
        if (!destNode || destNode.type !== 'dir') {
            fs.unlinkSync(path);
            throw 'Invalid parent node';
        }

        // Create and push new node
        const newNode = await new nodeModel({
            owner: user.id,
            id: filename,
            parent: parent,
            type: 'file',
            name: originalname,
            lastModified: Date.now(),
            marked: false,
            size
        }).save().then(node => {
            return pick(node, _config.mongodb.exposedProps.fileNode);
        }).catch(reason => {
            console.warn(reason); // eslint-disable-line no-console
            fs.unlink(path, () => 0);
            return null;
        });

        newNode && nodes.push(newNode);
    }

    return nodes;
};
