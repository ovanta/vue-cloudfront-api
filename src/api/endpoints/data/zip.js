const authViaApiKey = require('../../tools/authViaApiKey');
const generateZipFile = require('../../tools/generateZipStream');
const nodeModel = require('../../../models/node');

module.exports = async (req, res) => {
    const {apikey, nodes} = req.body;

    // Find user
    const user = await authViaApiKey(apikey);

    // Validate
    if (!Array.isArray(nodes) || nodes.some(v => typeof v !== 'string')) {
        throw 'Invalid nodes scheme';
    }

    // Find all nodes from this user and filter props
    return nodeModel.find({owner: user.id, id: {$in: nodes}}).exec().then(nds => {

        if (nds.length !== nodes.length) {
            throw 'Request contains invalid nodes';
        }

        // Create zip file
        return generateZipFile(user, nodes);
    }).then(stream => {
        stream.pipe(res);
    });
};
