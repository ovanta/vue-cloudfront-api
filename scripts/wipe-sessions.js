global._config = require('../config/config');

const userModel = require('../src/models/user');
const db = require('../src/db');

userModel.updateMany({}, {
    $set: {
        apikeys: []
    }
}).exec().then(() => {
    db.connection.close();
    console.log('Done.');
});
