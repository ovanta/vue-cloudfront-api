const uuidv1 = require('uuid/v1');
const bcrypt = require('bcrypt');
const config = require('../../config/config');
const node = require('../models/node');
const user = require('../models/user');

module.exports = async req => {
    const {username, password} = req.body;

    // Check to see if the user already exists and throw error if so
    return user.findOne({username}).exec().then(async opuser => {

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

        const apikey = uuidv1();
        const userid = uuidv1();

        await Promise.all([

            // Create user
            user({
                id: userid,
                username,
                password: bcrypt.hashSync(password, config.auth.saltRounds),
                apikeys: [{
                    key: apikey,
                    expiry: Date.now() + config.auth.apikeyExpiry
                }]
            }).save(),

            // Create entry node
            node({
                owner: userid,
                id: uuidv1(),
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
