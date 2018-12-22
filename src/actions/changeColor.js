const authViaApiKey = require('../auth/authViaApiKey');
const config = require('../../config/config');
const node = require('../models/node');

module.exports = async req => {
    const {nodes, newColor, apikey} = req.body;

    // Find user and validate color
    const user = await authViaApiKey(apikey);
    if (!new RegExp(config.validation.hexcolor).test(newColor)) {
        throw config.errors.invalid.hexcolor;
    }

    // Find all nodes from this user and filter props
    return node.find({owner: user.id, id: {$in: nodes}}).then(nodes => {

        // Change colors and save choosed nodes
        return Promise.all(nodes.map(v => {
            v.color = newColor;
            v.lastModified = Date.now();
            return v.save();
        }));

    }).then(() => null);
};
