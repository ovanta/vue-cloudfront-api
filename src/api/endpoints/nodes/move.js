const resolveChilds = require('../../tools/resolveChilds');
const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {destination, nodes, apikey} = req.body;

    // Authenticate and resolve child nodes
    const user = await authViaApiKey(apikey);

    await resolveChilds(user, nodes, node => {

        // Check if user paste folder into itself or one of its siblings
        if (node.id === destination) {
            throw 'A directory cannot be put into itself';
        }
    });

    if (typeof destination !== 'string') {
        throw 'Destination must be of type string';
    }

    // Check if destination exists and is a folder
    const destNode = await nodeModel.findOne({owner: user.id, id: destination}).exec();
    if (!destNode || destNode.type !== 'dir') {
        throw 'Destination does not exist or is not a directory';
    }

    // Validate
    if (!Array.isArray(nodes) || nodes.some(v => typeof v !== 'string')) {
        throw 'Invalid nodes scheme';
    }

    // Move childs
    await nodeModel.find({owner: user.id, id: {$in: nodes}}).exec().then(async nds => {

        if (nds.length !== nodes.length) {
            throw 'Request contains invalid nodes';
        }

        // Apply new parent
        for (let i = 0; i < nds.length; i++) {
            const node = nds[i];
            node.set('parent', destination);
            await node.save();
        }
    });
};
