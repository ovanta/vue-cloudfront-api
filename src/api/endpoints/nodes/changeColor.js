const authViaApiKey = require('../../tools/authViaApiKey');
const config = require('../../../../config/config');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {nodes, newColor, apikey} = req.body;

    // Find user and validate color
    const user = await authViaApiKey(apikey);
    if (!new RegExp(config.validation.hexcolor).test(newColor)) {
        throw config.errors.invalid.hexcolor;
    }

    // Find all nodes from this user and filter props
    return nodeModel.find({owner: user.id, id: {$in: nodes}}).then(nodes => {

        // Change colors and save choosed nodes
        return Promise.all(nodes.map(node => {
            node.color = newColor;
            node.lastModified = Date.now();
            return node.save();
        }));

    }).then(() => null);
};
