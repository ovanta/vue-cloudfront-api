const authViaApiKey = require('../auth/authViaApiKey');
const node = require('../models/node');

module.exports = async req => {
    const {nodes, apikey} = req.body;

    // Find user and validate dir name
    const user = await authViaApiKey(apikey);

    // Find all nodes from this user and filter props
    return node.find({owner: user.id, id: {$in: nodes}}).then(nodes => {

        // Mark folders
        return Promise.all(nodes.map(v => {
            v.marked = true;
            v.lastModified = Date.now();
            return v.save();
        }));

    }).then(() => null);
};
