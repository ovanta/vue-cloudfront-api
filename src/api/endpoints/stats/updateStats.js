const authViaApiKey = require('../../tools/authViaApiKey');
const Validator = new (require('jsonschema').Validator);
const statsScheme = _config.validation.schemes.stats;

module.exports = async req => {
    const {stats, apikey} = req.body;

    // Find user
    const user = await authViaApiKey(apikey);
    const validationResult = Validator.validate(stats, statsScheme);

    // Check if validation has failed
    if (validationResult.errors.length) {
        throw 'Invalid stats scheme';
    }

    // Apply, mark as modified and save
    user.stats = stats;
    user.markModified('stats');
    return user.save().then(() => null);
};
