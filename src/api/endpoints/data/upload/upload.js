const fs = require('fs');
const config = require('../../../../../config/config');
const {pick} = require('../../../../utils');
const authViaApiKey = require('../../../tools/authViaApiKey');
const nodeModel = require('../../../../models/node');

module.exports = async req => {
    const {body, files} = req;

    // Authenticate user
    const user = await authViaApiKey(body.apikey).catch(reason => {

        // Delete files
        for (const {path} of files) {
            fs.unlink(path);
        }

        throw reason;
    });

    // Negative value means infinite upload storage quote
    if (config.userStorageLimit >= 0) {

        // Check if upload size, including other files, don't exceed storage limit
        const contentLength = Number(req.get('content-length'));

        // Validate header
        if (isNaN(contentLength)) {
            throw 'Invalid content-length header';
        }

        // Calculate current storage size
        const currentStorageSize = (await nodeModel.find({owner: user.id, type: 'file'}, 'size').exec()).reduce((a, v) => a + v.size, 0);

        // Compare current storage size and upload size with limit
        if (contentLength + currentStorageSize > config.userStorageLimit) {
            throw `Storage limit of ${config.userStorageLimit} bytes exceed`;
        }
    }

    // Rename files and create nodes
    const nodes = [];
    for (const {fieldname, filename, originalname, path, size} of files) {

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
            return pick(node, ['id', 'parent', 'lastModified', 'type', 'name', 'marked', 'size', 'bin', 'staticIds']);
        }).catch(reason => {
            console.warn(reason); // eslint-disable-line no-console
            fs.unlinkSync(path);
            return null;
        });

        newNode && nodes.push(newNode);
    }

    return nodes;
};
