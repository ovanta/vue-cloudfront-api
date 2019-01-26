const fs = require('fs');
const config = require('../../../../config/config');
const authViaApiKey = require('../../tools/authViaApiKey');
const nodeModel = require('../../../models/node');

module.exports = async (req, res) => {
    const {id, apikey} = req.query;

    if (typeof id !== 'string') {
        throw 'Invalid node id';
    }

    // Authenticate user
    const user = await authViaApiKey(apikey);

    // Check if user is owner
    await nodeModel.findOne({owner: user.id, id}).exec().then(async node => {

        // Check node
        if (!node) {
            return res.status(404).send();
        }

        // Make sure the file exists
        const path = `${_storagePath}/${node.id}`;
        if (fs.existsSync(path)) {
            const fileSize = fs.statSync(path).size;

            res.contentType(node.name);
            res.set('Accept-Ranges', 'bytes');

            // Get the 'range' header if one was sent
            if (req.headers.range) {
                const match = req.headers.range.match(/bytes=([\d]+)-([\d]*)/);

                if (match) {
                    const start = Number(match[1]) || 0;
                    const chunkEnd = start + config.streamChunkSize;
                    const end = Number(match[2]) || (chunkEnd < fileSize ? chunkEnd : fileSize);

                    // Validate range
                    if (start >= 0 && end <= fileSize) {
                        res.set({
                            'Content-Disposition': `attachment; filename="${node.name}"`,
                            'Content-Length': end - start,
                            'Content-Range': `bytes ${start}-${end - 1}/${fileSize}`
                        });

                        // Set Partial Content header and stream range
                        res.status(206);
                        return fs.createReadStream(path, {start, end}).pipe(res);
                    }
                }

                // Invalid range header or range is out of bounds. Send Range Not Satisfiable code back
                return res.status(416).send();
            }

            res.set('Content-Length', fileSize);
            fs.createReadStream(path).pipe(res);
        } else {

            // Delete node because the corresponding file is mising
            await nodeModel.deleteOne({owner: user.id, id}).exec();
            res.status(404).send();
        }
    });
};
