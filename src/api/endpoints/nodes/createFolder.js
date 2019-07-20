const nodeModel = require('../../../models/node');
const {uid, pick} = require('../../../utils');

module.exports = async req => {
    const {_user, parent, name} = req.body;

    if (typeof parent !== 'string') {
        throw {code: 209, text: 'Both parent and name must be of type string'};
    }

    // Find all nodes from this user and filter props
    return nodeModel.findOne({owner: _user.id, id: parent}).exec().then(parent => {

        if (!parent) {
            throw {code: 210, text: 'Can\'t find parent'};
        }

        return new nodeModel({
            owner: _user.id,
            id: uid(),
            parent: parent.id,
            type: 'dir',
            name: name || 'New Folder',
            lastModified: Date.now(),
            color: _config.mongodb.defaultFolderColor,
            marked: false
        }).save();

    }).then(node => {
        return {
            node: pick(node, ['id', 'parent', 'type', 'name', 'lastModified', 'color', 'marked'])
        };
    });
};
