const userModel = require('../../models/user');

module.exports = async apikey => {

    if (typeof apikey !== 'string' || !apikey) {
        throw 'APIKey is invalid';
    }

    return userModel.findOne({
        apikeys: {
            $elemMatch: {
                key: apikey
            }
        }
    }).exec().then(user => {

        // Check if user exists
        if (!user) {
            throw {code: -1, text: 'APIKey is invalid'};
        }

        // Remove expired apikeys
        const now = Date.now();
        user.set('apikeys', user.apikeys.filter(
            ({expiry}) => expiry > now
        ));

        return user.save();
    });
};
