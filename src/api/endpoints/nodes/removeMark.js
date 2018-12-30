const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {nodes, apikey} = req.body;

    // Find user and validate dir name
    const user = await authViaApiKey(apikey);

    // Find all nodes from this user and filter props
    return nodeModel.find({owner: user.id, id: {$in: nodes}}).exec().then(nodes => {

        // Mark folders
        return Promise.all(nodes.map(v => {
            v.marked = false;
            v.lastModified = Date.now();
            return v.save();
        }));

    }).then(() => null);
};
