const {uid, readableDuration} = require('../../../utils');
const bcrypt = require('bcrypt');
const userModel = require('../../../models/user');

module.exports = async req => {
    const {username, password} = req.body;

    if (typeof username !== 'string' || typeof password !== 'string') {
        throw 'Both username and password must be of type string';
    }

    // Check to see if the user already exists and throw error if so
    return userModel.findOne({username}).exec().then(async user => {

        // Validate
        if (!user) {
            throw 'User not found';
        }

        // Check password
        if (!bcrypt.compareSync(password, user.password)) {
            const {blockedLoginDuration, maxLoginAttempts} = _config.auth;
            const lastLoginAttemptMs = Date.now() - user.lastLoginAttempt;

            // Check if user tried to many times to login
            if (user.loginAttempts >= maxLoginAttempts) {
                if (lastLoginAttemptMs < blockedLoginDuration) {
                    throw `Try again in ${readableDuration(blockedLoginDuration - lastLoginAttemptMs)}`;
                } else {
                    user.loginAttempts = 0;
                }
            }

            // Update login props
            user.set('loginAttempts', user.loginAttempts + 1);
            user.set('lastLoginAttempt', Date.now());
            await user.save();

            throw 'Wrong password';
        } else {

            // Reset loginAttempts
            user.set('loginAttempts', 0);
        }

        // Create and append new apikey
        const apikey = uid(_config.mongodb.apikeyLength);
        user.apikeys.push({
            key: apikey,
            expiry: Date.now() + _config.auth.apikeyExpiry
        });

        // Save user with new apikey
        await user.save();
        return {apikey};
    });
};
