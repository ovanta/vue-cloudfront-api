const nodeModel = require('../../models/node');

module.exports = async (user, nodes, cb) => {

    async function handleNode(node) {
        if (node) {
            cb(node);

            if (node.type === 'dir') {
                await traverseNode(node);
            }
        }
    }

    async function traverseNode(n) {

        // Find all nodes which have n as parent
        await nodeModel.find({owner: user.id, parent: n.id}).exec().then(async rnodes => {
            for (let i = 0, l = rnodes.length; i < l; i++) {
                await handleNode(rnodes[i]);
            }
        });
    }

    for (let i = 0, l = nodes.length; i < l; i++) {
        await handleNode(await nodeModel.findOne({owner: user.id, id: nodes[i]}).exec());
    }
};
