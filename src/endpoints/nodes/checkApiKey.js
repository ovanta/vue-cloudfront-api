const authViaApiKey = require('../tools/authViaApiKey');
module.exports = async req => authViaApiKey(req.body.apikey);
