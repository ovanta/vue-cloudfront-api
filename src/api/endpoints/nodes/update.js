const nodeModel = require('../../../models/node');
const {pick} = require('../../../utils');

module.exports = async req => {
    const {_user} = req.body;

    // Find all nodes from this user and filter props
    const {dirNode, fileNode} = _config.mongodb.exposedProps;
    return nodeModel.find({owner: _user.id}).exec().then(res => {
        for (let i = 0, l = res.length; i < l; i++) {
            const node = res[i];
            res[i] = pick(node, node.type === 'dir' ? dirNode : fileNode);
        }

        return {nodes: res};
    });
};

