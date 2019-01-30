const fs = require('fs');
const createZipStream = require('../../tools/createZipStream');
const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');

module.exports = async (req, res) => {
    const {apikey} = req.query;
    const {id} = req.params;

    if (typeof id !== 'string') {
        throw 'Invalid node id';
    }

    // Authenticate user
    const user = await authViaApiKey(apikey).catch(() => null);
    const node = await nodeModel.findOne(user ? {owner: user.id, id} : {staticIds: id}).exec();

    if (!node) {
        return res.status(404).send();
    }

    if (node.type === 'file') {
        const path = `${_config.server.storagePath}/${node.id}`;

        if (fs.existsSync(path)) {
            res.download(path, node.name);
        } else {

            // Delete node because the corresponding file is mising
            await nodeModel.deleteOne({id: node.id}).exec();
            res.status(404).send();
        }
    } else if (node.type === 'dir') {
        return createZipStream([node.id]).then(stream => {
            res.set('Content-Disposition', `attachment; filename=${node.name}.zip`);
            stream.pipe(res);
        });
    }
};
