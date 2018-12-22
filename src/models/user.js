const mongoose = require('./db');

module.exports = mongoose.model('User', {
    id: String,
    username: String,
    password: String,
    apikeys: [{
        key: String,
        expiry: Number
    }]
});

