const authViaApiKey = require('../../tools/authViaApiKey');

module.exports = async ({body: {apikey}}) => (await authViaApiKey(apikey)).stats;
