const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {_user, nodes, newColor} = req.body;

    // Validate
    if (!new RegExp(_config.validation.hexcolor).test(newColor)) {
        throw {code: 203, text: 'Color must be in hexadecimal format.'};
    }

    if (!Array.isArray(nodes) || nodes.some(v => typeof v !== 'string')) {
        throw {code: 204, text: 'Invalid nodes scheme'};
    }

    // Find all nodes from this user and filter props
    await nodeModel.updateMany(
        {owner: _user.id, id: {$in: nodes}},
        {
            $set: {
                color: newColor,
                lastModified: Date.now()
            }
        }
    );
};
