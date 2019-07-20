const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {_user, nodes} = req.body;

    // Validate
    if (!Array.isArray(nodes) || nodes.some(v => typeof v !== 'string')) {
        throw {code: 225, text: 'Invalid nodes scheme'};
    }

    await nodeModel.updateMany(
        {owner: _user.id, id: {$in: nodes}},
        {
            $set: {
                bin: false,
                lastModified: Date.now()
            }
        }
    );
};
