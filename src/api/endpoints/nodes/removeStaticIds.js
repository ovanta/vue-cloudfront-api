const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {ids, apikey} = req.body;

    // Find user
    const user = await authViaApiKey(apikey);

    if (!Array.isArray(ids) || ids.some(v => typeof v !== 'string')) {
        throw {code: 221, text: 'Ids must be an Array of strings'};
    }

    // Find requested node
    return nodeModel.updateMany(
        {owner: user.id},
        {
            $pullAll: {
                staticIds: ids
            }
        }
    ).exec().then(() => null);
};
