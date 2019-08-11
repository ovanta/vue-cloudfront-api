const userModel = require('../../../models/user');
const Ajv = require('ajv');

const settingsScheme = _config.validation.schemes.settings;
module.exports = async req => {
    const {_user, settings} = req.body;

    // Validate body
    const ajv = new Ajv();
    const valid = ajv.validate(settingsScheme, settings);

    // Check if validation has failed
    if (!valid) {
        throw {code: 300, text: 'Invalid request properties'};
    }

    // Apply, mark as modified and save
    return userModel.updateOne(
        {id: _user.id},
        {$set: {settings}}
    ).exec().then(() => null);
};
