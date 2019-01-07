const bcrypt = require('bcrypt');
const authViaApiKey = require('../../tools/authViaApiKey');
const config = require('../../../../config/config');
const userModel = require('../../../models/user');

module.exports = async req => {
    const {currentPassword, newUsername, newPassword, apikey} = req.body;

    // Find user and validate color
    const user = await authViaApiKey(apikey);

    // Validate password
    if (typeof currentPassword !== 'string' || !bcrypt.compareSync(currentPassword, user.password)) {
        throw 'Wrong password';
    }

    // Apply new username (if set)
    if (typeof newUsername === 'string') {

        // Check if already a user has this username
        if (await userModel.findOne({username: newUsername}).exec()) {
            throw  'A user with this name already exist';
        }

        // Validate username
        if (new RegExp(config.validation.username).test(newUsername)) {
            user.username = newUsername;
        } else {
            throw 'Username is too short or contains invalid characters';
        }
    } else if (newUsername !== undefined) {
        throw 'NewUsername must be of type string';
    }

    // Apply new password (if set)
    if (typeof newPassword === 'string') {

        // Validate password
        if (new RegExp(config.validation.password).test(newPassword)) {
            user.password = bcrypt.hashSync(newPassword, config.auth.saltRounds);
        } else {
            throw 'Password is too short';
        }
    } else if (newUsername !== undefined) {
        throw 'NewUsername must be of type string';
    }

    return user.save().then(() => null);
};
