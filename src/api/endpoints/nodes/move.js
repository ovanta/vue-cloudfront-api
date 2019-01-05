const resolveChilds = require('../../tools/resolveChilds');
const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {destination, nodes, apikey} = req.body;

    // Authenticate and resolve child nodes
    const user = await authViaApiKey(apikey);
    const childs = await resolveChilds(user, nodes);

    // Check if user paste folder into itself or one of its siblings
    if (childs.some(v => v.id === destination)) {
        throw 'A somenthing cannot be put into itself';
    }

    // Check if destination exists and is a folder
    const destNode = await nodeModel.findOne({owner: user.id, id: destination}).exec();
    if (!destNode || destNode.type !== 'dir') {
        throw 'Destination does not exist or is not a directory';
    }

    // Move childs
    await nodeModel.find({owner: user.id, id: {$in: nodes}}).exec().then(async nds => {

        if (nds.length !== nodes.length) {
            throw 'Request contains invalid nodes';
        }

        // Apply new parent
        for (let i = 0; i < nds.length; i++) {
            const node = nds[i];
            node.parent = destination;
            await node.save();
        }
    });
};
