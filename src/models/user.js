const mongoose = require('../db');

module.exports = mongoose.model('User', {
    id: String,
    username: String,
    password: String,

    lastLoginAttempt: {
        type: Number,
        required: true,
        default: 0
    },

    loginAttempts: {
        type: Number,
        required: true,
        default: 0
    },

    apikeys: [{
        key: String,
        expiry: Number
    }],

    events: {
        type: Object,
        required: true,
        default: {}
    }
});

