const authViaApiKey = require('../tools/authViaApiKey');
const node = require('../../models/node');
const _ = require('../../utils/utils');

module.exports = async req => authViaApiKey(req.body.apikey).then(user => {

    // Find all nodes from this user and filter props
    return node.find({owner: user.id}).then(res => {
        return {
            nodes: res.map(v => {
                if (v.type === 'dir') {
                    return _.pick(v, ['id', 'parent', 'lastModified', 'type', 'name', 'marked', 'color']);
                } else {
                    return _.pick(v, ['id', 'parent', 'lastModified', 'type', 'name', 'marked', 'size']);
                }
            })
        };
    });

});

