const fs = require('fs');
const authViaApiKey = require('../auth/authViaApiKey');
const config = require('../../config/config');
const node = require('../models/node');

module.exports = async req => {
    const {nodes, apikey} = req.body;

    const user = await authViaApiKey(apikey);

    // Holds all childnodes
    const totalNodes = [];

    async function addChilds(n) {

        // Find all nodes which have n as parent
        await node.find({owner: user.id, parent: n.id}).exec().then(async rnodes => {
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
        const rnode = await node.findOne({owner: user.id, id: nodes[i]}).exec();
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
            const path = `${__dirname}/../..${config.storagepath}/${node.id}`;
            if (fs.existsSync(path)) {
                fs.unlink(path, () => 0);
            }
        }
    }

    // Remove nodes
    const ids = totalNodes.map(v => v.id);
    return node.deleteMany({owner: user.id, id: {$in: ids}})
        .exec()
        .then(() => null);
};
