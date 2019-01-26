const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {target, newName, apikey} = req.body;

    // Find user
    const user = await authViaApiKey(apikey);
    if (typeof newName !== 'string' || !new RegExp(_config.validation.dirname).test(newName)) {
        throw 'Invalid new name';
    }

    if (typeof target !== 'string') {
        throw 'Target must be of type string';
    }

    // Find all nodes from this user and filter props
    return nodeModel.findOne({owner: user.id, id: target}).exec().then(node => {

        if (!node) {
            throw 'Can\'t find target node';
        }

        node.set('name', newName);
        node.set('lastModified', Date.now());
        return node.save();
    }).then(() => null);
};
