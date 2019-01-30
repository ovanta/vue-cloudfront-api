const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');
const {pick} = require('../../../utils');

module.exports = async req => authViaApiKey(req.body.apikey).then(user => {

    // Find all nodes from this user and filter props
    const {dirNode, fileNode} = _config.mongodb.exposedProps;
    return nodeModel.find({owner: user.id}).exec().then(res => {
        return {
            nodes: res.map(v => pick(v, v.type === 'dir' ? dirNode : fileNode))
        };
    });
});

