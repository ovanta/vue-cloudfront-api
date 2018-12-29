const authViaApiKey = require('../tools/authViaApiKey');
const nodeModel = require('../../models/node');
const {uid} = require('../../utils/utils');

module.exports = async req => {
    const {node, apikey} = req.body;

    // Find user and validate dir name
    const user = await authViaApiKey(apikey);

    // Find requested node
    return nodeModel.findOne({owner: user.id, id: node}).exec().then(node => {
        if (node && node.type === 'file') {

            // Add new static id
            const newUid = uid();
            node.staticIds.push(newUid);
            node.lastModified = Date.now();
            return node.save().then(() => newUid);
        } else {
            return null;
        }
    });
};
