const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');
const {uid} = require('../../../utils');

module.exports = async req => {
    const {node, apikey} = req.body;

    // Find user
    const user = await authViaApiKey(apikey);

    if (typeof node !== 'string') {
        throw {code: 201, text: 'Node must be of type string'};
    }

    // Find requested node
    return nodeModel.findOne({owner: user.id, id: node}).exec().then(node => {
        if (node) {

            // Add new static id
            const newUid = uid(_config.mongodb.staticLinkUIDLength);
            node.staticIds.push(newUid);
            node.set('lastModified', Date.now());
            return node.save().then(() => newUid);
        } else {
            throw {code: 202, text: 'Can\'t find requested node'};
        }
    });
};
