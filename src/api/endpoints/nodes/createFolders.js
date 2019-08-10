const {uid, pick} = require('../../../utils');
const nodeModel = require('../../../models/node');
const Ajv = require('ajv');

module.exports = async req => {
    const {_user, folders, parent} = req.body;

    const ajv = new Ajv();
    const valid = ajv.validate({
        'type': 'array',
        'items': {
            'type': 'object',
            'required': ['parent', 'id', 'name'],
            'properties': {
                'parent': {
                    'type': 'number',
                    'minimum': -1,
                    'maximum': folders.length
                },
                'id': {
                    'type': 'number',
                    'minimum': -1,
                    'maximum': folders.length
                },
                'name': {
                    'type': 'string'
                }
            }
        }
    }, folders);

    // Check if validation has failed
    if (!valid) {
        throw {code: 211, text: 'Invalid scheme'};
    }

    if (typeof parent !== 'string') {
        throw {code: 212, text: 'Parent must be of type string'};
    }

    return nodeModel.findOne({owner: _user.id, id: parent}).exec().then(async root => {

        if (!root) {
            throw {code: 213, text: 'Invalid root node'};
        }

        // Create uids
        const folderAmount = folders.length;
        const idMap = {[-1]: root.id};
        for (let i = 0; i < folderAmount; i++) {
            idMap[i] = uid();
        }

        // Create nodes
        const nodes = [];
        for (let i = 0; i < folderAmount; i++) {
            const folder = folders[i];

            // Create folder
            const newNode = await new nodeModel({
                owner: _user.id,
                id: idMap[folder.id],
                parent: idMap[folder.parent],
                type: 'dir',
                name: folder.name || 'Unknown',
                lastModified: Date.now(),
                color: _config.mongodb.defaultFolderColor,
                marked: false
            }).save().then(node => {
                return pick(node, ['id', 'parent', 'type', 'name', 'lastModified', 'color', 'marked']);
            });

            nodes.push(newNode);
        }

        return {idMap, nodes};
    });
};
