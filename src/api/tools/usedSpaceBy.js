const nodeModel = require('../../models/node');

/**
 * Calculates the total amount of space a user use in bytes
 * @param userid
 * @returns {Promise<number>}
 */
module.exports = async userid => {

    if (_config.server.totalStorageLimitPerUser >= 0) {

        // Calculate current storage size
        let currentStorageSize = 0;
        const nodes = await nodeModel.find({owner: userid, type: 'file'}, 'size').exec();
        for (let i = 0, n = nodes.length; i < n; i++) {
            currentStorageSize += nodes[i].size || 0;
        }

        return currentStorageSize;
    }

    return 0;
};
