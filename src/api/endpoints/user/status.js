module.exports = async req => {
    const {_user} = req.body;

    return {
        availableSpace: _config.server.totalStorageLimitPerUser,
        uploadSizeLimitPerFile: _config.server.uploadSizeLimitPerFile,
        user: {
            id: _user.id,
            username: _user.username,
            lastLogin: _user.lastLoginAttempt,
            loginAttempts: _user.loginAttempts
        }
    };
};
