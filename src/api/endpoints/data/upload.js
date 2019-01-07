const formidable = require('formidable');
const fs = require('fs');
const {uid, pick} = require('../../../utils');
const authViaApiKey = require('../../tools/authViaApiKey');
const config = require('../../../../config/config');
const nodeModel = require('../../../models/node');

module.exports = async req => {

    // Create formidable instance and set save-path
    const form = new formidable.IncomingForm();
    form.maxFileSize = config.maxRequestSize;
    form.uploadDir = _storagePath;

    return new Promise(async (resolve, reject) => {

        // Parse form
        form.parse(req, async (err, fields, files) => {
            const {apikey} = fields;

            if (err || !apikey) {
                return reject('Invalid request');
            }

            // Authenticate user
            const user = await authViaApiKey(apikey);

            // Rename files and create nodes
            const nodes = [];
            for (const [prefixedParent, file] of Object.entries(files)) {
                const nodeid = uid();

                /**
                 * Beause fordata cannot have multiple values assigned to
                 * one key, they're prefixed with a index: [HASH]-[INDEX]
                 *
                 * Extract the hash.
                 */
                const [parent] = prefixedParent.match(/^[^-]+/) || [];
                if (!parent) {
                    fs.unlinkSync(file.path);
                    return reject('Invalid node key');
                }

                // Check if destination exists and is a folder
                const destNode = await nodeModel.findOne({owner: user.id, id: parent}).exec();
                if (!destNode || destNode.type !== 'dir') {
                    fs.unlinkSync(file.path);
                    return reject('Invalid parent node');
                }

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

            Promise.all(nodes).then(nodes => {
                resolve(
                    nodes.map(v => pick(v, ['id', 'parent', 'lastModified', 'type', 'name', 'marked', 'size', 'staticIds']))
                );
            }).catch(e => {
                console.warn(e); // eslint-disable-line no-console
                reject('Internal error');
            });
        });
    });
};
