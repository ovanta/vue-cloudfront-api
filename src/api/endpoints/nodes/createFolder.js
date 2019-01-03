const {uid} = require('../../../utils');
const authViaApiKey = require('../../tools/authViaApiKey');
const config = require('../../../../config/config');
const nodeModel = require('../../../models/node');
const _ = require('../../../utils');

module.exports = async req => {
    const {parent, name, apikey} = req.body;

    const user = await authViaApiKey(apikey);

    // Find all nodes from this user and filter props
    return nodeModel.findOne({owner: user.id, id: parent}).then(parent => {

        if (!parent) {
            throw config.errors.impossible.nodeNotFound;
        }

        return new nodeModel({
            owner: user.id,
            id: uid(),
            parent: parent.id,
            type: 'dir',
            name: name || 'New Folder',
            lastModified: Date.now(),
            color: '#7E58C2',
            marked: false
        }).save();

    }).then(node => {
        return {
            node: _.pick(node, ['id', 'parent', 'type', 'name', 'lastModified', 'color', 'marked'])
        };
    });
};
