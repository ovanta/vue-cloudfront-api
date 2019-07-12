const mongoose = require('mongoose');

// Resolve correct host
const host = process.env.NODE_ENV === 'production' ? 'mongo' : 'localhost';

// Connect to database
mongoose.connect(`mongodb://${host}:27017/${_config.mongodb.databaseName}`, {
    useNewUrlParser: true
}).catch(reason => {
    console.error(reason); // eslint-disable-line no-console
    process.exit(1);
});

module.exports = mongoose;
