const userModel = require('../../models/user');

module.exports = async apikey => {

    if (typeof apikey !== 'string' || !apikey) {
        throw 'APIKey is invalid';
    }

    return userModel.findOne({
        apikeys: {
            $elemMatch: {
                key: apikey, // Match key
                expiry: {
                    $gte: Date.now() // Make sure that the API key is not expired
                }
            }
        }
    }).exec().then(user => {

        // Check if user exists
        if (!user) {
            throw 'APIKey is invalid';
        }

        return user;
    });

};
