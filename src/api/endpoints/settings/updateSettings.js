const userModel = require('../../../models/user');
const Validator = new (require('jsonschema').Validator);
const settingsScheme = _config.validation.schemes.settings;

module.exports = async req => {
    const {_user, settings} = req.body;

    // Validate body
    const validationResult = Validator.validate(settings, settingsScheme);

    // Check if validation has failed
    if (validationResult.errors.length) {
        throw {code: 300, text: 'Invalid settings scheme'};
    }

    // Apply, mark as modified and save
    return userModel.updateOne(
        {id: _user.id},
        {$set: {settings}}
    ).exec().then(() => null);
};
