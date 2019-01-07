const fs = require('fs');
const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');

module.exports = async (req, res) => {
    const {id, apikey} = req.query;

    if (typeof id !== 'string') {
        throw 'Invalid node id';
    }

    // Authenticate user
    const user = await authViaApiKey(apikey);

    // Check if user is owner
    await nodeModel.findOne({owner: user.id, id}).then(async node => {

        // Check node
        if (!node) {
            return res.status(404).send();
        }

        // Check file
        const path = `${_storagePath}/${node.id}`;
        if (fs.existsSync(path)) {
            res.contentType(node.name);
            fs.createReadStream(path).pipe(res);
        } else {

            // Delete node because the corresponding file is mising
            await nodeModel.deleteOne({owner: user.id, id});
            res.status(404).send();
        }
    });
};
