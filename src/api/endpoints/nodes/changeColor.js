const authViaApiKey = require('../../tools/authViaApiKey');
const config = require('../../../../config/config');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {nodes, newColor, apikey} = req.body;

    // Find user and validate color
    const user = await authViaApiKey(apikey);

    // Validate
    if (!new RegExp(config.validation.hexcolor).test(newColor)) {
        throw 'Color must be in hexadecimal format.';
    }

    if (!Array.isArray(nodes) || nodes.some(v => typeof v !== 'string')) {
        throw 'Invalid nodes scheme';
    }

    // Find all nodes from this user and filter props
    return nodeModel.find({owner: user.id, id: {$in: nodes}}).then(nds => {

        if (nds.length !== nodes.length) {
            throw 'Request contains invalid nodes';
        }

        // Change colors and save choosed nodes
        return Promise.all(nds.map(node => {
            node.color = newColor;
            node.lastModified = Date.now();
            return node.save();
        }));

    }).then(() => null);
};
