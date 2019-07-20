const websocket = require('../../../websocket');

module.exports = async req => {
    const {_user} = req.body;

    // Clear apikeys
    _user.apikeys = [];
    _user.markModified('apikeys');

    // Broadcast logout
    websocket.broadcast({
        userid: _user.id,
        type: 'logout',
        data: null
    });

    return _user.save().then(() => null);
};
