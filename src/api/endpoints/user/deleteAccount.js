const fs = require('fs');
const bcrypt = require('bcrypt');
const authViaApiKey = require('../../tools/authViaApiKey');
const config = require('../../../../config/config');
const userModel = require('../../../models/user');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {password, apikey} = req.body;

    // Find user and validate color
    const currentUser = await authViaApiKey(apikey);

    // Validate password
    if (!bcrypt.compareSync(password, currentUser.password)) {
        throw  config.errors.user.wrongPassword;
    }

    return Promise.all([

        // Delete files
        nodeModel.find({owner: currentUser.id}).then(nodes => {
            for (let i = 0, n; n = nodes[i], i < nodes.length; i++) {
                if (n.type === 'file') {

                    // Build local storage path and check if file exists
                    const path = `${__dirname}/../../..${config.storagepath}/${nodeModel.id}`;
                    if (fs.existsSync(path)) {
                        fs.unlink(path, () => 0);
                    }
                }
            }
        }),

        // Remove nodes
        nodeModel.deleteMany({owner: currentUser.id}).exec(),

        // Remove user
        userModel.deleteOne({id: currentUser.id})
    ]);
};
