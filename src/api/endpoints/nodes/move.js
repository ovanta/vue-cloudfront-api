const traverseNodes = require('../../tools/traverseNodes');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {_user, destination, nodes} = req.body;

    await traverseNodes(_user, nodes, node => {

        // Check if user paste folder into itself or one of its siblings
        if (node.id === destination) {
            throw {code: 214, text: 'A directory cannot be put into itself'};
        }
    });

    if (typeof destination !== 'string') {
        throw {code: 215, text: 'Destination must be of type string'};
    }

    // Check if destination exists and is a folder
    const destNode = await nodeModel.findOne({owner: _user.id, id: destination}).exec();
    if (!destNode || destNode.type !== 'dir') {
        throw {code: 216, text: 'Destination does not exist or is not a directory'};
    }

    // Validate
    if (!Array.isArray(nodes) || nodes.some(v => typeof v !== 'string')) {
        throw {code: 217, text: 'Invalid nodes scheme'};
    }

    // Move childs
    await nodeModel.find({owner: _user.id, id: {$in: nodes}}).exec().then(async nds => {

        if (nds.length !== nodes.length) {
            throw {code: 218, text: 'Request contains invalid nodes'};
        }

        // Apply new parent
        for (let i = 0; i < nds.length; i++) {
            const node = nds[i];
            node.set('parent', destination);
            await node.save();
        }
    });
};
