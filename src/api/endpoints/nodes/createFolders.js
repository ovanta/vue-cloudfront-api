const {uid, pick} = require('../../../utils');
const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');
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

    return nodeModel.findOne({owner: user.id, id: parent}).exec().then(async root => {

        if (!root) {
            throw 'Invalid root node';
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
                owner: user.id,
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
