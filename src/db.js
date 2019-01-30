const mongoose = require('mongoose');

// Connect to database
mongoose.connect(`mongodb://localhost/${_config.mongodb.databaseName}`, {useNewUrlParser: true}).catch(reason => {
    console.error(reason); // eslint-disable-line no-console
    process.exit(1);
});

module.exports = mongoose;
