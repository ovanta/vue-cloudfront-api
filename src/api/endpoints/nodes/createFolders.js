const {uid} = require('../../../utils');
const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');
const _ = require('../../../utils');
const Validator = require('jsonschema').Validator;
const FolderstructValidator = new Validator();

module.exports = async req => {
    const {folders, parent, apikey} = req.body;

    // Check user, find parent and validate folders
    const user = await authViaApiKey(apikey);
    const validationResult = FolderstructValidator.validate(folders, {
        'type': 'array',
        'items': {
            'type': 'object',
            'properties': {
                'parent': {
                    'type': 'number',
                    'minimum': -1,
                    'maximum': folders.length,
                    'required': true
                },
                'id': {
                    'type': 'number',
                    'minimum': -1,
                    'maximum': folders.length,
                    'required': true
                },
                'name': {
                    'type': 'string',
                    'required': true
                }
            }
        }
    });

    // Check if validation has failed
    if (validationResult.errors.length) {
        throw validationResult.errors.toString();
    }

    if (typeof parent !== 'string') {
        throw 'Parent must be of type string';
    }

    return nodeModel.findOne({owner: user.id, id: parent}).then(async root => {

        if (!root) {
            throw 'Invalid root node';
        }

        // Fill with real ids
        const idMap = {
            [-1]: root.id,
            ...(new Array(folders.length)).fill(0).map(() => uid())
        };

        for (const folder of folders) {
            folder.id = idMap[folder.id];
            folder.parent = idMap[folder.parent];
        }

        const nodes = folders.map(folder => new nodeModel({
            owner: user.id,
            id: folder.id,
            parent: folder.parent,
            type: 'dir',
            name: folder.name || 'Unknown',
            lastModified: Date.now(),
            color: '#333333',
            marked: false
        }).save());

        return Promise.all(nodes).then(nodes => ({
            idMap,
            nodes: nodes.map(node => _.pick(node, ['id', 'parent', 'type', 'name', 'lastModified', 'color', 'marked']))
        }));
    });
};
