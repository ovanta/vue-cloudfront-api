const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {_user, ids} = req.body;

    if (!Array.isArray(ids) || ids.some(v => typeof v !== 'string')) {
        throw {code: 221, text: 'Ids must be an Array of strings'};
    }

    // Find requested node
    return nodeModel.updateMany(
        {owner: _user.id},
        {
            $pullAll: {
                staticIds: ids
            }
        }
    ).exec().then(() => null);
};
