const authViaApiKey = require('../../tools/authViaApiKey');
const websocket = require('../../../websocket');

module.exports = async req => {
    const {apikey} = req.body;

    // Find user and validate color
    const user = await authViaApiKey(apikey);

    // Clear apikeys
    user.apikeys = [];
    user.markModified('apikeys');

    // Broadcast logout
    websocket.broadcast(user.id, {
        type: 'logout',
        data: null
    });

    return user.save().then(() => null);
};
