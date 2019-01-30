const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {target, newName, apikey} = req.body;

    // Find user
    const user = await authViaApiKey(apikey);
    if (typeof newName !== 'string' || !new RegExp(_config.validation.dirname).test(newName)) {
        throw 'Invalid new name';
    }

    if (typeof target !== 'string') {
        throw 'Target must be of type string';
    }

    // Rename node
    await nodeModel.updateOne(
        {owner: user.id, id: target},
        {
            $set: {
                name: newName,
                lastModified: Date.now()
            }
        }
    );
};
