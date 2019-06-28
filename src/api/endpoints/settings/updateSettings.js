const authViaApiKey = require('../../tools/authViaApiKey');
const Validator = new (require('jsonschema').Validator);
const settingsScheme = _config.validation.schemes.settings;
const userModel = require('../../../models/user');

module.exports = async req => {
    const {settings, apikey} = req.body;

    // Find user
    const user = await authViaApiKey(apikey);
    const validationResult = Validator.validate(settings, settingsScheme);

    // Check if validation has failed
    if (validationResult.errors.length) {
        throw 'Invalid stats scheme';
    }

    // Apply, mark as modified and save
    return userModel.updateOne(
        {id: user.id},
        {$set: {settings}}
    ).exec().then(() => null);
};
