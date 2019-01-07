const authViaApiKey = require('../../tools/authViaApiKey');
const Validator = new (require('jsonschema').Validator);

module.exports = async req => {
    const {events, apikey} = req.body;

    // Find user
    const user = await authViaApiKey(apikey);
    const validationResult = Validator.validate(events, {
        'introBoxes': {
            'type': 'array',
            'minItems': 0,
            'maxItems': 3,
            'items': {
                'type': 'string'
            }
        }
    });

    // Check if validation has failed
    if (validationResult.errors.length) {
        throw 'Invalid event scheme';
    }

    // Fill events
    for (const event of ['introBoxes']) {
        user.events[event] = events[event] || user.events[event];
    }

    // Mark modified and save
    user.markModified('events');
    return user.save().then(() => null);
};
