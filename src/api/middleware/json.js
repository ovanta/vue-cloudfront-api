const bodyParser = require('body-parser');

module.exports = bodyParser.json({
    limit: '50mb'
});
