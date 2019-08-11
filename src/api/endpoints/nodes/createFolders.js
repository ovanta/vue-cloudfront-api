const {uid, pick} = require('../../../utils');
const nodeModel = require('../../../models/node');
const Ajv = require('ajv');

const foldertreeScheme = _config.validation.schemes.foldertree;
module.exports = async req => {
    const {_user, folders, parent} = req.body;

    const ajv = new Ajv();
    const valid = ajv.validate(foldertreeScheme, folders);

    // Check if validation has failed
    if (!valid) {
        throw {code: 211, text: 'Invalid request properties'};
    }

    if (typeof parent !== 'string') {
        throw {code: 212, text: 'Parent must be of type string'};
    }

    const exposedDirNodeProps = _config.mongodb.exposedProps.dirNode;
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
                color: _user.settings.user.defaultFolderColor,
                marked: false
            }).save().then(node => {
                return pick(node, exposedDirNodeProps);
            });

            nodes.push(newNode);
        }

        return {idMap, nodes};
    });
};
