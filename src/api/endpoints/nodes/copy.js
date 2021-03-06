const usedSpaceBy = require('../../tools/usedSpaceBy');
const nodeModel = require('../../../models/node');
const {uid, pick} = require('../../../utils');
const mongoose = require('mongoose');
const fs = require('fs');

module.exports = async req => {
    const {_user, destination, nodes} = req.body;

    if (typeof destination !== 'string') {
        throw {code: 205, text: 'Destination must be of type string'};
    }

    // Check if destination exists and is a folder
    const destNode = await nodeModel.findOne({owner: _user.id, id: destination}).exec();
    if (!destNode || destNode.type !== 'dir') {
        throw {code: 206, text: 'Destination does not exist or is not a directory'};
    }

    // Validate
    if (!Array.isArray(nodes) || nodes.some(v => typeof v !== 'string')) {
        throw {code: 207, text: 'Invalid nodes scheme'};
    }

    // Used to check whenever a copy is because of storage limit not possible
    let spaceUsed = await usedSpaceBy(_user.id);
    const {totalStorageLimitPerUser} = _config.server;
    const updateUsedSpace = amount => {
        if (~totalStorageLimitPerUser) {
            spaceUsed += amount;

            if (spaceUsed > totalStorageLimitPerUser) {
                throw {code: 208, text: `Storage limit of ${totalStorageLimitPerUser} bytes exceed`};
            }
        }
    };

    const newNodes = [];

    /* eslint-disable require-atomic-updates */
    async function addChilds(n, newParent) {
        const newId = uid();

        // Node is new
        n._id = mongoose.Types.ObjectId();
        n.isNew = true;

        if (n.type === 'dir') {

            // Find all nodes which have n as parent
            await nodeModel.find({owner: _user.id, parent: n.id}).exec().then(async rnodes => {
                for (let i = 0, n; n = rnodes[i], i < rnodes.length; i++) {

                    // Find all children recursive
                    await addChilds(n, newId);
                }
            });
        } else {

            // Copy file
            const src = `${_config.server.storagePath}/${n.id}`;
            const dest = `${_config.server.storagePath}/${newId}`;
            if (fs.existsSync(src)) {
                const {size} = fs.statSync(src);
                await updateUsedSpace(size);

                fs.copyFileSync(src, dest);
            } else {
                await nodeModel.deleteOne({owner: _user.id, id: n.id});
                return;
            }
        }

        // Update id and parent
        n.id = newId;
        n.parent = newParent;
        newNodes.push(await n.save());
    }

    const rnodes = await nodeModel.find({owner: _user.id, id: {$in: nodes}}).exec();
    const destNodes = await nodeModel.find({owner: _user.id, parent: destination}).exec();
    for (let i = 0, n; n = rnodes[i], i < rnodes.length; i++) {

        // Apply new name
        n.name = buildCopyName(n, destNodes);

        // Find all children recursive
        await addChilds(n, destination);
    }

    const {dirNode, fileNode} = _config.mongodb.exposedProps;
    return Promise.resolve({
        nodes: newNodes.map(v => pick(v, v.type === 'dir' ? dirNode : fileNode))
    });
};

function buildCopyName(node, nodes) {

    // Extract name and extenstion
    const {name: vName, extension: vExtension} = parseName(node.name);

    // Find previous copied versions
    let version = 1, match;
    for (let i = 0, n; n = nodes[i], i < nodes.length; i++) {

        // Extract raw name without any extensions
        const {name: nName} = parseName(n.name);

        /**
         * Check if node starts with the current to-copy nodes name and
         * has already a copy flag increase it.
         */
        if (n.name.startsWith(vName) &&
            (match = nName.match(/\((([\d]+)(st|nd|rd|th) |)Copy\)$/))) {

            // Check if node has been already multiple times copied
            if (match[2]) {
                const val = Number(match[2]);

                // Check if version is above current
                if (val && val >= version) {
                    version = val + 1;
                }
            }
        }
    }

    return `${vName} ${version ? ` (${spelledNumber(version)} ` : '('}Copy)${vExtension}`;
}

// Function to extract a name and extension from a filename
function parseName(name) {
    const rdi = name.indexOf('.');
    const di = ~rdi ? rdi : name.length;
    return {name: name.substring(0, di), extension: name.substring(di, name.length)};
}

function spelledNumber(num) {
    switch (num) {
        case 1:
            return `${num}st`;
        case 2:
            return `${num}nd`;
        case 3:
            return `${num}rd`;
        default:
            return `${num}th`;
    }
}
