const nodeModel = require('../../../models/node');
const userModel = require('../../../models/user');
const bcrypt = require('bcrypt');
const fs = require('fs');

module.exports = async req => {
    const {_user, password} = req.body;

    // Validate password
    if (typeof password !== 'string' || !bcrypt.compareSync(password, _user.password)) {
        throw {code: 400, text: 'Password incorrect'};
    }

    return Promise.all([

        // Delete files
        nodeModel.find({owner: _user.id}).exec().then(nodes => {
            for (let i = 0, n; n = nodes[i], i < nodes.length; i++) {
                if (n.type === 'file') {

                    // Build local storage path and check if file exists
                    const path = `${_config.server.storagePath}/${nodeModel.id}`;
                    if (fs.existsSync(path)) {
                        fs.unlink(path, () => 0);
                    }
                }
            }
        }),

        // Remove nodes
        nodeModel.deleteMany({owner: _user.id}).exec(),

        // Remove user
        userModel.deleteOne({id: _user.id}).exec()
    ]);
};
