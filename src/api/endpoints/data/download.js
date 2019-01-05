const fs = require('fs');
const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');

module.exports = async (req, res) => {
    const {id, apikey} = req.query;

    // Authenticate user
    const node = await authViaApiKey(apikey).then(async user => {
        const node = await nodeModel.findOne({owner: user.id, id}).exec();

        // Check node
        if (!node) {
            throw 'Can\'t find target node';
        }

        return node;
    }).catch(async () => {
        const node = await nodeModel.findOne({staticIds: id}).exec();

        // Check node
        if (!node) {
            throw 'Can\'t find target node';
        }

        return node;
    });

    // Check file
    const path = `${_storagePath}/${node.id}`;
    if (fs.existsSync(path)) {
        res.download(path, node.name);
    } else {
        console.warn(`Invalid file path: ${path}`); // eslint-disable-line no-console
        throw 'Can\'t find target node';
    }
};
