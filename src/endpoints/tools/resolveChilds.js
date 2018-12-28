const fs = require('fs');
const config = require('../../../config/config');
const nodeModel = require('../../models/node');

module.exports = async (user, nodes) => {

    // Holds all childnodes
    const totalNodes = [];

    async function addChilds(n) {

        // Find all nodes which have n as parent
        await nodeModel.find({owner: user.id, parent: n.id}).exec().then(async rnodes => {
            for (let i = 0; i < rnodes.length; i++) {
                const rnode = rnodes[i];
                totalNodes.push(rnode);

                // Find all children recursive
                if (rnode.type === 'dir') {
                    await addChilds(rnode);
                }
            }
        });
    }

    for (let i = 0; i < nodes.length; i++) {
        const rnode = await nodeModel.findOne({owner: user.id, id: nodes[i]}).exec();
        totalNodes.push(rnode);

        if (rnode.type === 'dir') {
            await addChilds(rnode);
        }
    }

    // Delete files
    for (let i = 0; i < totalNodes.length; i++) {
        const node = totalNodes[i];

        // Remove file if node is an file
        if (node.type === 'file') {

            // Build local storage path and check if file exists
            const path = `${__dirname}/../../..${config.storagepath}/${node.id}`;
            if (fs.existsSync(path)) {
                fs.unlink(path, () => 0);
            }
        }
    }

    return totalNodes;
};
