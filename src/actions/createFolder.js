const uuidv1 = require('uuid/v1');
const authViaApiKey = require('../auth/authViaApiKey');
const node = require('../models/node');
const _ = require('../utils/utils');

module.exports = async req => {
    const {parent, apikey} = req.body;

    const user = await authViaApiKey(apikey);

    // Find all nodes from this user and filter props
    return node.find({owner: user.id, id: parent}).then(() => node({
        owner: user.id,
        id: uuidv1(),
        parent: parent,
        type: 'dir',
        name: 'New Folder',
        lastModified: Date.now(),
        color: '#7E58C2',
        marked: false
    }).save()).then(node => {
        return {
            node: _.pick(node, ['id', 'parent', 'type', 'name', 'lastModified', 'color', 'marked'])
        };
    });

};
