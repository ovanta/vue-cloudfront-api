const {uid} = require('../../../../utils');
const storageEngine = require('./storageEngine');
const multer = require('multer');
const fs = require('fs');

const formdata = multer({
    storage: storageEngine(() => `${global._config.server.storagePath}/${uid(10)}`),
    limits: {
        fileSize: _config.server.uploadSizeLimitPerFile
    }
}).any();

module.exports = (req, res, next) => {

    // Listen if request gets canceled
    req.on('aborted', () => {
        if (req.incomingFiles) {
            for (const {stream, path} of req.incomingFiles) {

                // Kill stream if not already closed
                if (!stream.closed) {
                    stream.end();
                }

                // Delete file
                if (fs.existsSync(path)) {
                    fs.unlink(path, () => 0);
                }
            }
        }
    });

    formdata(req, res, next);
};
