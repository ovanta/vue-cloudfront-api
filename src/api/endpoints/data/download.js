const fs = require('fs');
const authViaApiKey = require('../../tools/authViaApiKey');
const config = require('../../../../config/config');
const nodeModel = require('../../../models/node');

module.exports = async (req, res) => {
    const {id, apikey} = req.query;

    // Authenticate user
    const node = await authViaApiKey(apikey).then(async user => {
        const node = await nodeModel.findOne({owner: user.id, id}).exec();

        // Check node
        if (!node) {
            throw config.errors.impossible.nodeNotFound;
        }

        return node;
    }).catch(async () => {
        const node = await nodeModel.findOne({staticIds: id}).exec();

        // Check node
        if (!node) {
            throw config.errors.impossible.nodeNotFound;
        }

        return node;
    });

    // Check file
    const path = `${_storagePath}/${node.id}`;
    if (fs.existsSync(path)) {
        res.download(path, node.name);
    } else {
        throw config.errors.impossible.nodeNotFound;
    }
};
