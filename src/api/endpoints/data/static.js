const nodeModel = require('../../../models/node');
const fs = require('fs');

module.exports = async (req, res) => {
    const {_user, id} = req.body;

    if (typeof id !== 'string') {
        throw {code: 103, text: 'Invalid node id'};
    }

    // Check if user is owner
    await nodeModel.findOne({owner: _user.id, id}).exec().then(async node => {

        // Check node
        if (!node) {
            return res.status(404).send();
        }

        // Check if in demo mode
        if (_config.demo) {
            const {name} = node;

            for (const {regex, url} of _config.demoContent) {
                if (name.match(new RegExp(regex, 'i'))) {
                    return res.redirect(url);
                }
            }
        }

        // Make sure the file exists
        const path = `${_config.server.storagePath}/${node.id}`;
        if (fs.existsSync(path)) {
            const fileSize = fs.statSync(path).size;

            res.contentType(node.name);
            res.set('Accept-Ranges', 'bytes');

            // Get the 'range' header if one was sent
            if (req.headers.range) {
                const match = req.headers.range.match(/bytes=([\d]+)-([\d]*)/);

                if (match) {
                    const start = Number(match[1]) || 0;
                    const chunkEnd = start + _config.server.mediaStreamChunckSize;
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
            await nodeModel.deleteOne({owner: _user.id, id}).exec();
            res.status(404).send();
        }
    });
};
