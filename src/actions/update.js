const authViaApiKey = require('../auth/authViaApiKey');
const node = require('../models/node');
const _ = require('../utils/utils');

module.exports = async req => authViaApiKey(req.body.apikey).then(user => {

    // Find all nodes from this user and filter props
    return node.find({owner: user.id}).then(res => {
        return {
            nodes: res.map(v =>
                _.pick(v, ['id', 'parent', 'lastModified', 'type', 'name', 'marked', 'color'])
            )
        };
    });

});

