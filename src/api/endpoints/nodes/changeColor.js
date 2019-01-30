const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {nodes, newColor, apikey} = req.body;

    // Find user and validate color
    const user = await authViaApiKey(apikey);

    // Validate
    if (!new RegExp(_config.validation.hexcolor).test(newColor)) {
        throw 'Color must be in hexadecimal format.';
    }

    if (!Array.isArray(nodes) || nodes.some(v => typeof v !== 'string')) {
        throw 'Invalid nodes scheme';
    }

    // Find all nodes from this user and filter props
    await nodeModel.updateMany(
        {owner: user.id, id: {$in: nodes}},
        {
            $set: {
                color: newColor,
                lastModified: Date.now()
            }
        }
    );
};
