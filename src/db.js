const {dbname} = require('../config/config');
const mongoose = require('mongoose');

// Connect to database
mongoose.connect(`mongodb://localhost/${dbname}`, {useNewUrlParser: true});

module.exports = mongoose;
