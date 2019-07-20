const fs = require('fs');
const traverseNodes = require('../../tools/traverseNodes');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {_user, nodes} = req.body;

    // Validate
    if (!Array.isArray(nodes) || nodes.some(v => typeof v !== 'string')) {
        throw {code: 100, text: 'Invalid nodes scheme'};
    }

    // Resolve id's and remove files from file system
    const ids = [];
    await traverseNodes(_user, nodes, node => {

        // Prevent deleting of root element
        if (node.parent === 'root') {
            throw {code: 101, text: 'Can\'t delete root node'};
        }

        // Remove file if node is an file
        if (node.type === 'file') {

            // Delete file
            fs.unlink(`${_config.server.storagePath}/${node.id}`, () => 0);
        }

        ids.push(node.id);
    });

    // Remove nodes
    return nodeModel.deleteMany({owner: _user.id, id: {$in: ids}})
        .exec()
        .then(() => null);
};
