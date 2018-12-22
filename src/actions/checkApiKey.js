const authViaApiKey = require('../auth/authViaApiKey');
module.exports = async req => authViaApiKey(req.body.apikey);
