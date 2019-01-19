const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {nodes, apikey} = req.body;

    // Find user
    const user = await authViaApiKey(apikey);

    // Validate
    if (!Array.isArray(nodes) || nodes.some(v => typeof v !== 'string')) {
        throw 'Invalid nodes scheme';
    }

    // Find all nodes from this user and filter props
    return nodeModel.find({owner: user.id, id: {$in: nodes}}).exec().then(nds => {

        if (nds.length !== nodes.length) {
            throw 'Request contains invalid nodes';
        }

        // "Restore" nodes from bin
        return Promise.all(nds.map(node => {
            node.set('bin', false);
            node.set('lastModified', Date.now());
            return node.save();
        }));

    }).then(() => null);
};
