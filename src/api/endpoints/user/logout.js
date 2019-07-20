module.exports = async req => {
    const {_user, apikey} = req.body;

    // Remove apikey
    const apikeyIndex = _user.apikeys.findIndex(v => v.key === apikey);

    // Validate index and logout user
    if (~apikeyIndex) {
        _user.apikeys.splice(apikeyIndex, 1);
        _user.markModified('apikeys');
    }

    return _user.save().then(() => null);
};
