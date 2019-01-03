const {uid} = require('../../../utils');
const bcrypt = require('bcrypt');
const config = require('../../../../config/config');
const nodeModel = require('../../../models/node');
const userModel = require('../../../models/user');

module.exports = async req => {
    const {username, password} = req.body;

    // Check if registrations are disabled
    if (config.disableRegistration) {
        throw config.errors.impossible.disableRegistration;
    }

    // Check to see if the user already exists and throw error if so
    return userModel.findOne({username}).exec().then(async opuser => {

        // Validate
        if (opuser) {
            throw  config.errors.user.alreadyExists;
        }

        if (!new RegExp(config.validation.username).test(username)) {
            throw config.errors.invalid.username;
        }

        if (!new RegExp(config.validation.password).test(password)) {
            throw config.errors.invalid.password;
        }

        const apikey = uid();
        const userid = uid();

        await Promise.all([

            // Create user
            new userModel({
                id: userid,
                username,
                password: bcrypt.hashSync(password, config.auth.saltRounds),

                apikeys: [{
                    key: apikey,
                    expiry: Date.now() + config.auth.apikeyExpiry
                }]
            }).save(),

            // Create entry node
            new nodeModel({
                owner: userid,
                id: uid(),
                parent: 'root',
                lastModified: Date.now(),
                type: 'dir',
                name: 'Home',
                marked: false,
                color: '#538afc'
            }).save()

        ]);

        return {apikey};
    });
};
