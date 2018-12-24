const uuidv1 = require('uuid/v1');
const bcrypt = require('bcrypt');
const config = require('../../../config/config');
const user = require('../../models/user');

module.exports = async req => {
    const {username, password} = req.body;

    // Check to see if the user already exists and throw error if so
    return user.findOne({username}).exec().then(async opuser => {

        // Validate
        if (!opuser) {
            throw config.errors.user.notFound;
        }

        if (!bcrypt.compareSync(password, opuser.password)) {
            throw  config.errors.user.wrongPassword;
        }

        // Create and append new apikey
        const apikey = uuidv1();
        opuser.apikeys.push({
            key: apikey,
            expiry: Date.now() + config.auth.apikeyExpiry
        });

        // Save user with new apikey
        await opuser.save();
        return {apikey};
    });
};
