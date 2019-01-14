const fs = require('fs');
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

    // Rename files and create nodes
    const nodes = [];
    for (const {fieldname, filename, originalname, path, size} of files) {

        /**
         * Beause fordata cannot have multiple values assigned to
         * one key, they're prefixed with a index: [HASH]-[INDEX]
         *
         * Extract the hash.
         */
        const [parent] = fieldname.match(/^[^-]+/) || [];
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
        nodes.push(new nodeModel({
            owner: user.id,
            id: filename,
            parent: parent,
            type: 'file',
            name: originalname,
            lastModified: Date.now(),
            marked: false,
            size
        }).save());
    }
    return Promise.all(nodes).then(nodes => {
        return nodes.map(v => pick(v, ['id', 'parent', 'lastModified', 'type', 'name', 'marked', 'size', 'staticIds']));
    }).catch(e => {
        console.warn(e); // eslint-disable-line no-console
        throw 'Internal error';
    });
};