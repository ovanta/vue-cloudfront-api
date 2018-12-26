const fs = require('fs');
const {uid} = require('../../utils/utils');
const mongoose = require('mongoose');
const authViaApiKey = require('../tools/authViaApiKey');
const config = require('../../../config/config');
const node = require('../../models/node');

module.exports = async req => {
    const {destination, nodes, apikey} = req.body;

    // Authenticate
    const user = await authViaApiKey(apikey);

    // Check if destination exists and is a folder
    const destNode = await node.findOne({owner: user.id, id: destination}).exec();
    if (!destNode || destNode.type !== 'dir') {
        throw config.errors.invalid.destination;
    }

    async function addChilds(n) {
        const newId = uid();

        // Node is new
        n._id = mongoose.Types.ObjectId();
        n.isNew = true;

        if (n.type === 'dir') {

            // Find all nodes which have n as parent
            await node.find({owner: user.id, parent: n.id}).exec().then(async rnodes => {
                for (let i = 0, n; n = rnodes[i], i < rnodes.length; i++) {

                    // Node is new
                    n._id = mongoose.Types.ObjectId();
                    n.isNew = true;

                    // Find all children recursive
                    await addChilds(n);

                    // Element got a new parent
                    n.parent = newId;
                    await n.save();
                }
            });
        } else {

            // Copy file
            const src = `${__dirname}/../../..${config.storagepath}/${n.id}`;
            const dest = `${__dirname}/../../..${config.storagepath}/${newId}`;
            if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
            }
        }

        n.id = newId;
        await n.save();
        return Promise.resolve();
    }

    const rnodes = await node.find({owner: user.id, id: {$in: nodes}}).exec();
    const destNodes = await node.find({owner: user.id, parent: destination}).exec();
    for (let i = 0, n; n = rnodes[i], i < rnodes.length; i++) {

        // Parent is the copy destination, also gets a new id
        n.parent = destination;

        // Apply new name
        n.name = buildCopyName(n, destNodes);

        // Find all children recursive
        await addChilds(n);
    }

    return Promise.resolve();
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
