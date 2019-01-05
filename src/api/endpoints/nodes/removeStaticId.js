const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {node, id, apikey} = req.body;

    // Find user
    const user = await authViaApiKey(apikey);

    // Find requested node
    return nodeModel.findOne({owner: user.id, id: node}).exec().then(node => {
        if (node && node.type === 'file') {

            // Remove static id
            node.staticIds = node.staticIds.filter(v => v !== id);
            return node.save().then(() => null);
        } else {
            throw 'Can\'t find requested node';
        }
    });
};
