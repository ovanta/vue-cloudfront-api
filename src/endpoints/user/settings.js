const bcrypt = require('bcrypt');
const authViaApiKey = require('../tools/authViaApiKey');
const config = require('../../../config/config');
const user = require('../../models/user');

module.exports = async req => {
    const {currentPassword, newUsername, newPassword, apikey} = req.body;

    // Find user and validate color
    const currentUser = await authViaApiKey(apikey);

    // Validate password
    if (!bcrypt.compareSync(currentPassword, currentUser.password)) {
        throw  config.errors.user.wrongPassword;
    }

    // Apply new username (if set)
    if (newUsername) {

        // Check if already a user has this username
        if (!!(await user.findOne({username: newUsername}).exec())) {
            throw config.errors.user.alreadyExists;
        }

        // Validate username
        if (new RegExp(config.validation.username).test(newUsername)) {
            currentUser.username = newUsername;
        } else {
            throw config.errors.invalid.username;
        }
    }

    // Apply new password (if set)
    if (newPassword) {

        // Validate password
        if (new RegExp(config.validation.password).test(newPassword)) {
            currentUser.password = bcrypt.hashSync(newPassword, config.auth.saltRounds);
        } else {
            throw config.errors.invalid.password;
        }
    }

    return currentUser.save().then(() => null);
};
