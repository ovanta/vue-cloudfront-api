const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');
const {pick} = require('../../../utils');

module.exports = async req => authViaApiKey(req.body.apikey).then(user => {

    // Find all nodes from this user and filter props
    return nodeModel.find({owner: user.id}).exec().then(res => {
        return {
            nodes: res.map(v => {
                if (v.type === 'dir') {
                    return pick(v, ['id', 'parent', 'lastModified', 'type', 'name', 'marked', 'bin', 'color', 'staticIds']);
                } else {
                    return pick(v, ['id', 'parent', 'lastModified', 'type', 'name', 'marked', 'size', 'bin', 'staticIds']);
                }
            })
        };
    });
});

