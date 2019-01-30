const nodeModel = require('../../models/node');
const JSZip = require('jszip');
const fs = require('fs');

module.exports = async (nodes) => {
    const zip = new JSZip();

    async function handleNode(path = '', node) {

        if (node.type === 'file') {

            // Zip single file
            zip.file(path, fs.createReadStream(`${_config.server.storagePath}/${node.id}`));
        } else if (node.type === 'dir') {

            // Resolve child nodes
            return nodeModel.find({parent: node.id}).exec().then(async rnodes => {
                for (let i = 0, l = rnodes.length; i < l; i++) {
                    const node = rnodes[i];
                    await handleNode(`${path}/${node.name}`, node);
                }
            });
        }
    }

    for (let i = 0, l = nodes.length; i < l; i++) {
        await nodeModel.findOne({id: nodes[i]}).exec().then(node => {
            if (node) {
                return handleNode(node.name, node);
            }
        });
    }

    return zip.generateNodeStream({type: 'nodebuffer', streamFiles: true})
};
