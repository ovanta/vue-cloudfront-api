const fs = require('fs');
const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');

module.exports = async (req, res) => {
    const {apikey} = req.query;
    const {id} = req.params;

    if (typeof id !== 'string') {
        throw 'Invalid node id';
    }

    // Authenticate user
    const node = await authViaApiKey(apikey).then(async user => {
        const node = await nodeModel.findOne({owner: user.id, id}).exec();

        // Check node
        if (!node) {
            throw node;
        }

        return node;
    }).catch(async () => {
        const node = await nodeModel.findOne({staticIds: id}).exec();

        // Check node
        if (!node) {
            throw 'Can\'t find target node';
        }

        return node;
    }).catch(() => {
        res.status(404).send();
        return null;
    });

    if (node) {

        // Check file
        const path = `${_config.server.storagePath}/${node.id}`;
        if (fs.existsSync(path)) {
            res.download(path, node.name);
        } else {

            // Delete node because the corresponding file is mising
            await nodeModel.deleteOne({id: node.id}).exec();
            res.status(404).send();
        }
    }
};
