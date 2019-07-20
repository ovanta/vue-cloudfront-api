const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {_user, target, newName} = req.body;

    if (typeof newName !== 'string' || !new RegExp(_config.validation.dirname).test(newName)) {
        throw {code: 223, text: 'Invalid new name'};
    }

    if (typeof target !== 'string') {
        throw {code: 224, text: 'Target must be of type string'};
    }

    // Rename node
    await nodeModel.updateOne(
        {owner: _user.id, id: target},
        {
            $set: {
                name: newName,
                lastModified: Date.now()
            }
        }
    );
};
