const formidable = require('formidable');
const fs = require('fs');
const {uid, pick} = require('../../../utils');
const authViaApiKey = require('../../tools/authViaApiKey');
const config = require('../../../../config/config');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {apikey, parent} = req.query;

    // Authenticate user
    const user = await authViaApiKey(apikey);

    // Check if destination exists and is a folder
    const destNode = await nodeModel.findOne({owner: user.id, id: parent}).exec();
    if (!destNode || destNode.type !== 'dir') {
        throw config.errors.invalid.destination;
    }

    // Create formidable instance and set save-path
    const form = new formidable.IncomingForm();
    form.maxFileSize = config.maxRequestSize;
    form.uploadDir = _storagePath;

    return new Promise(async resolve => {

        // Parse form
        form.parse(req, (err, fields, files) => {

            if (err) {
                return;
            }

            // Rename files and create nodes
            const nodes = [];
            for (const file of Object.values(files)) {
                const nodeid = uid();

                // Rename file
                const [dir] = file.path.match(/.*[\\/]/);
                fs.rename(file.path, `${dir}${nodeid}`, () => 0);

                // Create and push new node
                nodes.push(new nodeModel({
                    owner: user.id,
                    id: nodeid,
                    parent: parent,
                    type: 'file',
                    name: file.name,
                    lastModified: Date.now(),
                    marked: false,
                    size: file.size
                }).save());
            }

            Promise.all(nodes).then(n => {
                const filteredNodes = n.map(v => pick(v, ['id', 'parent', 'lastModified', 'type', 'name', 'marked', 'size', 'staticIds']));
                resolve(filteredNodes);
            });
        });
    });
};
