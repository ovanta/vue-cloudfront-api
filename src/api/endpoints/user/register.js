const {uid} = require('../../../utils');
const bcrypt = require('bcrypt');
const config = require('../../../../config/config');
const nodeModel = require('../../../models/node');
const userModel = require('../../../models/user');

module.exports = async req => {
    const {username, password} = req.body;

    // Check if registrations are disabled
    if (config.disableRegistration) {
        throw 'Registration is currently disabled';
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
        throw 'Both username and password must be of type string';
    }

    // Check to see if the user already exists and throw error if so
    return userModel.findOne({username}).exec().then(async opuser => {

        // Validate
        if (opuser) {
            throw  'A user with this name already exist';
        }

        if (!new RegExp(config.validation.username).test(username)) {
            throw 'Username is too short or contains invalid characters';
        }

        if (!new RegExp(config.validation.password).test(password)) {
            throw 'Password is too short';
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
                color: config.defaultFolderColor
            }).save()
        ]);

        return {apikey};
    });
};
