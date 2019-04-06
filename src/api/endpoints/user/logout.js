const authViaApiKey = require('../../tools/authViaApiKey');

module.exports = async req => {
    const {apikey} = req.body;

    // Find user and validate color
    const user = await authViaApiKey(apikey);

    // Remove apikey
    const apikeyIndex = user.apikeys.findIndex(v => v.key === apikey);

    // Validate index and logut user
    if (~apikeyIndex) {
        user.apikeys.splice(apikeyIndex, 1);
        user.markModified('apikeys');
    }

    return user.save().then(() => null);
};
