const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {nodes, apikey} = req.body;

    // Find user
    const user = await authViaApiKey(apikey);

    // Validate
    if (!Array.isArray(nodes) || nodes.some(v => typeof v !== 'string')) {
        throw 'Invalid nodes scheme';
    }

    // Unmark nodes
    await nodeModel.updateMany(
        {owner: user.id, id: {$in: nodes}},
        {
            $set: {
                marked: false,
                lastModified: Date.now()
            }
        }
    );
};
