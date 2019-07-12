const bcrypt = require('bcrypt');
const authViaApiKey = require('../../tools/authViaApiKey');
const userModel = require('../../../models/user');

module.exports = async req => {
    const {currentPassword, newUsername, newPassword, apikey} = req.body;

    // Find user and validate color
    const user = await authViaApiKey(apikey);

    // Validate password
    if (typeof currentPassword !== 'string' || !bcrypt.compareSync(currentPassword, user.password)) {
        throw {code: 411, text: 'Wrong password'};
    }

    // Apply new username (if set)
    if (typeof newUsername === 'string' && newUsername) {

        // Check if already a user has this username
        if (await userModel.findOne({username: newUsername}).exec()) {
            throw {code: 412, text: 'A user with this name already exist'};
        }

        // Validate username
        if (new RegExp(_config.validation.username).test(newUsername)) {
            user.set('username', newUsername);
        } else {
            throw {code: 413, text: 'Username is too short or contains invalid characters'};
        }
    }

    // Apply new password (if set)
    if (typeof newPassword === 'string' && newPassword) {

        // Validate password
        if (new RegExp(_config.validation.password).test(newPassword)) {
            user.set('password', bcrypt.hashSync(newPassword, _config.auth.saltRounds));
        } else {
            throw {code: 414, text: 'Password is too short'};
        }
    }

    await user.save();
};
