const {uid, readableDuration} = require('../../../utils');
const bcrypt = require('bcrypt');
const userModel = require('../../../models/user');

module.exports = async req => {
    const {
        username,
        password,
        expireAfter = _config.auth.apikeyExpiry,
        expireAt = null
    } = req.body;

    if (typeof username !== 'string' || typeof password !== 'string') {
        throw {code: 402, text: 'Both username and password must be of type string'};
    }

    // Check to see if the user already exists and throw error if so
    return userModel.findOne({username}).exec().then(async user => {

        // Validate
        if (!user) {
            throw {code: 402, text: 'User not found'};
        }

        // Check password
        if (!bcrypt.compareSync(password, user.password)) {
            const {blockedLoginDuration, maxLoginAttempts} = _config.auth;
            const lastLoginAttemptMs = Date.now() - user.lastLoginAttempt;

            // Check if user tried to many times to login
            if (user.loginAttempts >= maxLoginAttempts) {
                if (lastLoginAttemptMs < blockedLoginDuration) {
                    throw {code: 404, text: `Try again in ${readableDuration(blockedLoginDuration - lastLoginAttemptMs)}`};
                } else {
                    user.loginAttempts = 0;
                }
            }

            // Update login props
            user.set('loginAttempts', user.loginAttempts + 1);
            user.set('lastLoginAttempt', Date.now());
            await user.save();

            throw {code: 404, text: 'Wrong password'};
        } else {

            // Reset loginAttempts
            user.set('loginAttempts', 0);
        }

        // Create and append new apikey
        const expire = (Date.now() + expireAfter) || (Date.now() + _config.auth.apikeyExpiry);
        const apikey = uid(_config.mongodb.apikeyLength);
        user.apikeys.push({
            key: apikey,
            expiry: typeof expireAt === 'number' ? expireAt : expire
        });

        // Save user with new apikey
        await user.save();
        return {apikey};
    });
};
