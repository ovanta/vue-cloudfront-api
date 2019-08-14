const {uid} = require('../../../utils');
const bcrypt = require('bcrypt');
const nodeModel = require('../../../models/node');
const userModel = require('../../../models/user');

module.exports = async req => {
    const {username, password} = req.body;

    // Check if registrations are disabled
    if (_config.auth.disableRegistration) {
        throw {code: 406, text: 'Registration is currently disabled'};
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
        throw {code: 407, text: 'Both username and password must be of type string'};
    }

    // Check to see if the user already exists and throw error if so
    return userModel.findOne({username}).exec().then(async opuser => {

        // Validate
        if (opuser) {
            throw {code: 408, text: 'A user with this name already exist'};
        }

        if (!new RegExp(_config.validation.username).test(username)) {
            throw {code: 409, text: 'Username is too short or contains invalid characters'};
        }

        if (!new RegExp(_config.validation.password).test(password)) {
            throw {code: 410, text: 'Password is too short'};
        }

        const apikey = uid(_config.mongodb.apikeyLength);
        const userid = uid();

        await Promise.all([

            // Create user
            new userModel({
                id: userid,
                username,
                password: bcrypt.hashSync(password, _config.auth.saltRounds),

                apikeys: [{
                    key: apikey,
                    expiry: Date.now() + _config.auth.apikeyExpiry
                }],

                settings: _config.auth.defaultSettings
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
                color: null
            }).save()
        ]);

        return {apikey};
    });
};
