const authViaApiKey = require('../endpoints/tools/authViaApiKey');
module.exports = async req => authViaApiKey(req.body.apikey);
