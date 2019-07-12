const fs = require('fs');
const authViaApiKey = require('../../tools/authViaApiKey');
const traverseNodes = require('../../tools/traverseNodes');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {nodes, apikey} = req.body;

    // Authenticate and resolve child nodes
    const user = await authViaApiKey(apikey);

    // Validate
    if (!Array.isArray(nodes) || nodes.some(v => typeof v !== 'string')) {
        throw {code: 100, text: 'Invalid nodes scheme'};
    }

    // Resolve id's and remove files from file system
    const ids = [];
    await traverseNodes(user, nodes, node => {

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
    return nodeModel.deleteMany({owner: user.id, id: {$in: ids}})
        .exec()
        .then(() => null);
};
