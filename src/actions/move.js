const resolveChilds = require('./tools/resolveChilds');
const authViaApiKey = require('../auth/authViaApiKey');
const config = require('../../config/config');
const node = require('../models/node');

module.exports = async req => {
    const {destination, nodes, apikey} = req.body;

    // Authenticate and resolve child nodes
    const user = await authViaApiKey(apikey);
    const childs = await resolveChilds(user, nodes);

    // Check if user paste folder into itself or one of its siblings
    if (childs.some(v => v.id === destination)) {
        throw config.errors.invalid.move;
    }

    // Move childs
    await node.find({owner: user.id, id: {$in: nodes}}).exec().then(async nodes => {

        // Apply new parent
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            node.parent = destination;
            await node.save();
        }
    });
};
