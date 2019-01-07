const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {nodes, apikey} = req.body;

    // Find user
    const user = await authViaApiKey(apikey);

    // Find all nodes from this user and filter props
    return nodeModel.find({owner: user.id, id: {$in: nodes}}).exec().then(nds => {

        if (nds.length !== nodes.length) {
            throw 'Request contains invalid nodes';
        }

        // Mark nodes
        return Promise.all(nds.map(node => {
            node.marked = true;
            node.lastModified = Date.now();
            return node.save();
        }));

    }).then(() => null);
};
