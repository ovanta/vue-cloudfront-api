const authViaApiKey = require('../../tools/authViaApiKey');

module.exports = async req => {
    const {event, apikey} = req.body;

    // Find user
    const user = await authViaApiKey(apikey);

    // Resolve event
    if (event === 'all') {
        return user.events;
    } else if (['introBoxes'].includes(event)) {
        return user.events[event];
    } else {
        throw 'Invalid event name';
    }
};
