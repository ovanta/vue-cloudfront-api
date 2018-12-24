const config = require('../../../config/config');
const user = require('../../models/user');

module.exports = async apikey => {

    if (typeof apikey !== 'string' || !apikey) {
        throw config.errors.invalid.apikey;
    }

    return user.findOne({
        apikeys: {
            $elemMatch: {
                key: apikey, // Match key
                expiry: {
                    $gte: Date.now() // Make sure that the API key is not expired
                }
            }
        }
    }).then(user => {

        // Check if user exists
        if (!user) {
            throw config.errors.invalid.apikey;
        }

        return user;
    });

};
