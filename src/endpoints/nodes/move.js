const resolveChilds = require('../tools/resolveChilds');
const authViaApiKey = require('../tools/authViaApiKey');
const config = require('../../../config/config');
const nodeModel = require('../../models/node');

module.exports = async req => {
    const {destination, nodes, apikey} = req.body;

    // Authenticate and resolve child nodes
    const user = await authViaApiKey(apikey);
    const childs = await resolveChilds(user, nodes);

    // Check if user paste folder into itself or one of its siblings
    if (childs.some(v => v.id === destination)) {
        throw config.errors.invalid.move;
    }

    // Check if destination exists and is a folder
    const destNode = await nodeModel.findOne({owner: user.id, id: destination}).exec();
    if (!destNode || destNode.type !== 'dir') {
        throw config.errors.invalid.destination;
    }

    // Move childs
    await nodeModel.find({owner: user.id, id: {$in: nodes}}).exec().then(async nodes => {

        // Apply new parent
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            node.parent = destination;
            await node.save();
        }
    });
};
