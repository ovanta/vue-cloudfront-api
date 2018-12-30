const bcrypt = require('bcrypt');
const authViaApiKey = require('../../tools/authViaApiKey');
const config = require('../../../../config/config');
const userModel = require('../../../models/user');

module.exports = async req => {
    const {currentPassword, newUsername, newPassword, apikey} = req.body;

    // Find user and validate color
    const user = await authViaApiKey(apikey);

    // Validate password
    if (!bcrypt.compareSync(currentPassword, user.password)) {
        throw  config.errors.user.wrongPassword;
    }

    // Apply new username (if set)
    if (newUsername) {

        // Check if already a user has this username
        if (await userModel.findOne({username: newUsername}).exec()) {
            throw config.errors.user.alreadyExists;
        }

        // Validate username
        if (new RegExp(config.validation.username).test(newUsername)) {
            user.username = newUsername;
        } else {
            throw config.errors.invalid.username;
        }
    }

    // Apply new password (if set)
    if (newPassword) {

        // Validate password
        if (new RegExp(config.validation.password).test(newPassword)) {
            user.password = bcrypt.hashSync(newPassword, config.auth.saltRounds);
        } else {
            throw config.errors.invalid.password;
        }
    }

    return user.save().then(() => null);
};
