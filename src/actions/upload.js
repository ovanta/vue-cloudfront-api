const formidable = require('formidable');
const fs = require('fs');
const uuidv1 = require('uuid/v1');
const authViaApiKey = require('../auth/authViaApiKey');
const config = require('../../config/config');
const node = require('../models/node');

module.exports = async req => {
    const [, apikey, parent] = req.url.match(/apikey=(.*?)&parent=(.*)/);

    // Find user and validate dir name
    const user = await authViaApiKey(apikey);

    // Create formidable instance and set save-path
    const form = new formidable.IncomingForm();
    form.uploadDir = `${__dirname}/../../${config.storagepath}`;

    return new Promise(async resolve => {

        // Parse form
        form.parse(req, (err, fields, files) => {

            // TODO: Log?
            if (err) {
                return;
            }

            // Rename files and create nodes
            const nodes = [];
            Object.values(files).forEach(file => {
                const nodeid = uuidv1();

                // Rename file
                const [dir] = file.path.match(/.*\\/);
                fs.rename(file.path, `${dir}${nodeid}`, () => 0);

                // Create and push new node
                nodes.push(node({
                    owner: user.id,
                    id: nodeid,
                    parent: parent,
                    type: 'file',
                    name: file.name,
                    lastModified: Date.now(),
                    marked: false,
                    size: file.size
                }));
            });

            Promise.all(nodes.map(v => v.save())).then(resolve);
        });
    });

};
