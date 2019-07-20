const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {_user, nodes} = req.body;

    // Validate
    if (!Array.isArray(nodes) || nodes.some(v => typeof v !== 'string')) {
        throw {code: 220, text: 'Invalid nodes scheme'};
    }

    // Unmark nodes
    await nodeModel.updateMany(
        {owner: _user.id, id: {$in: nodes}},
        {
            $set: {
                marked: false,
                lastModified: Date.now()
            }
        }
    );
};
