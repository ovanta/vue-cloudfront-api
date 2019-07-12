const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {node, ids, apikey} = req.body;

    // Find user
    const user = await authViaApiKey(apikey);

    if (typeof node !== 'string' || !Array.isArray(ids) || ids.some(v => typeof v !== 'string')) {
        throw {code: 221, text: 'Node must be of type string and ids should be an Array of strings'};
    }

    // Find requested node
    return nodeModel.findOne({owner: user.id, id: node}).exec().then(node => {
        if (node) {

            // Remove static id
            node.set('staticIds', node.staticIds.filter(ids => !ids.includes(ids)));
            return node.save().then(() => null);
        } else {
            throw {code: 222, text: 'Can\'t find requested node'};
        }
    });
};
