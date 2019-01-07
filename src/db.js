const {dbname} = require('../config/config');
const mongoose = require('mongoose');

// Connect to database
mongoose.connect(`mongodb://localhost/${dbname}`, {useNewUrlParser: true}).catch(reason => {
    console.error(reason); // eslint-disable-line no-console
    process.exit(1);
});

module.exports = mongoose;
