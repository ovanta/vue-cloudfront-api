const config = require('../../../../config/config');
const {uid} = require('../../../utils');
const multer = require('multer');
const fs = require('fs');

const formdata = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, global._storagePath),
        filename(req, file, cb) {
            const name = uid(10);

            // Save filename in case of request abort
            req.fileNames.push(name);
            cb(null, name);
        }
    }),
    limits: {
        fileSize: config.maxRequestSize
    }
}).any();

module.exports = (req, res, next) => {

    // Holds filenames if request has been aborted
    req.fileNames = [];

    req.on('aborted', () => {
        for (const fileName of req.fileNames) {

            // Create path and delete file
            const path = `${_storagePath}/${fileName}`;
            if (fs.existsSync(path)) {
                fs.unlink(path, () => 0);
            }
        }
    });

    formdata(req, res, next);
};
