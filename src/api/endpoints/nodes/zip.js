const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');
const {uid, pick} = require('../../../utils');
const createZipStream = require('../../tools/createZipStream');
const path = require('path');
const fs = require('fs');

module.exports = async req => {
    const {nodes, apikey} = req.body;

    // Find user
    const user = await authViaApiKey(apikey);

    // Validate
    if (!Array.isArray(nodes) || nodes.some(v => typeof v !== 'string')) {
        throw 'Invalid nodes scheme';
    }

    // Create name
    const aNode = await nodeModel.findOne({id: nodes[0]}).exec();
    if (!aNode) {
        throw 'Trying to zip nothing (or invalid nodes)';
    }

    const nameNode = nodes.length === 1 ? aNode : await nodeModel.findOne({id: aNode.parent}).exec();
    if (!nameNode) {
        throw 'Can\'t find parent node';
    }

    // Zip files
    const name = `${nameNode.name}.zip`;
    const id = uid();
    return createZipStream(nodes).then(stream => {

        // Calculate size
        let size = 0;
        stream.on('data', chunk => size += chunk.length);

        // Pipe to file
        return new Promise((resolve, reject) => {
            stream.pipe(fs.createWriteStream(path.join(_config.server.storagePath, id)))
                .on('finish', () => resolve(size))
                .on('error', reject);
        });

    }).then(size => {
        return new nodeModel({
            owner: user.id,
            id,
            parent: aNode.parent,
            type: 'file',
            name,
            lastModified: Date.now(),
            marked: false,
            size
        }).save();
    }).then(node => {
        return {node: pick(node, _config.mongodb.exposedProps.fileNode)};
    }).catch(() => {
        throw 'Zipping failed';
    });
};
