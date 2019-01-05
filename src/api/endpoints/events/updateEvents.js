const authViaApiKey = require('../../tools/authViaApiKey');
const Validator = require('jsonschema').Validator;
const EventValidator = new Validator();

module.exports = async req => {
    const {events, apikey} = req.body;

    // Find user
    const user = await authViaApiKey(apikey);
    const validationResult = EventValidator.validate(events, {
        'introBoxes': {
            'type': 'array',
            'items': {
                'type': 'string'
            },
            'minItems': 0,
            'maxItems': 3
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

    user.markModified('events');
    return user.save().then(() => null);
};
