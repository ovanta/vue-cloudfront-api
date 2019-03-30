const authViaApiKey = require('../../tools/authViaApiKey');
const websocket = require('../../../websocket');

module.exports = async req => {
    const {apikey} = req.body;

    // Find user and validate color
    const user = await authViaApiKey(apikey);

    return {
        availableSpace: _config.server.totalStorageLimitPerUser,
        uploadSizeLimitPerFile: _config.server.uploadSizeLimitPerFile,
        activeSessions: websocket.getSessionsBy(user.id),
        user: {
            id: user.id,
            username: user.username,
            lastLogin: user.lastLoginAttempt,
            loginAttempts: user.loginAttempts
        }
    };
};
