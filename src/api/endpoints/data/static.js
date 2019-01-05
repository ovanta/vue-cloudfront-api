const fs = require('fs');
const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');

module.exports = async (req, res) => {
    const {id, apikey} = req.query;

    // Authenticate user
    const user = await authViaApiKey(apikey);

    // Check if user is owner
    nodeModel.findOne({owner: user.id, id}).then(node => {

        // Check node
        if (!node) {
            throw 'Can\'t find target node';
        }

        // Check file
        const path = `${_storagePath}/${node.id}`;
        if (fs.existsSync(path)) {
            res.contentType(node.name);
            fs.createReadStream(path).pipe(res);
        } else {
            console.warn(`Invalid file path: ${path}`); // eslint-disable-line no-console
            throw 'Can\'t find target node';
        }
    });
};
