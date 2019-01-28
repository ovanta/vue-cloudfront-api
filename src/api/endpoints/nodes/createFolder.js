const {uid} = require('../../../utils');
const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');
const _ = require('../../../utils');

module.exports = async req => {
    const {parent, name, apikey} = req.body;

    const user = await authViaApiKey(apikey);

    if (typeof parent !== 'string') {
        throw 'Both parent and name must be of type string';
    }

    // Find all nodes from this user and filter props
    return nodeModel.findOne({owner: user.id, id: parent}).exec().then(parent => {

        if (!parent) {
            throw 'Can\'t find parent';
        }

        return new nodeModel({
            owner: user.id,
            id: uid(),
            parent: parent.id,
            type: 'dir',
            name: name || 'New Folder',
            lastModified: Date.now(),
            color: _config.server.defaultFolderColor,
            marked: false
        }).save();

    }).then(node => {
        return {
            node: _.pick(node, ['id', 'parent', 'type', 'name', 'lastModified', 'color', 'marked'])
        };
    });
};
