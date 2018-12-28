const authViaApiKey = require('../tools/authViaApiKey');
const config = require('../../../config/config');
const nodeModel = require('../../models/node');

module.exports = async req => {
    const {target, newName, apikey} = req.body;

    // Find user and validate dir name
    const user = await authViaApiKey(apikey);
    if (!new RegExp(config.validation.dirname).test(newName)) {
        throw config.errors.invalid.dirname;
    }

    // Find all nodes from this user and filter props
    return nodeModel.findOne({owner: user.id, id: target}).then(node => {

        if (!node) {
            throw config.errors.impossible.notfound;
        }

        node.name = newName;
        node.lastModified = Date.now();
        return node.save();
    }).then(() => null);
};
