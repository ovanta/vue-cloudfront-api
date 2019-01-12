const fs = require('fs');
const path = require('path');

class StorageEngine {

    constructor(destination) {
        this.destination = destination;
    }

    _handleFile(req, file, cb) {
        const dest = this.destination(req, file);

        // Check path
        if (!dest || typeof dest !== 'string') {
            throw `Invalid path: ${dest}`;
        }

        const stream = fs.createWriteStream(dest);
        file.stream.pipe(stream);

        // Save stream and filepath to request object
        req.incomingFiles = req.incomingFiles || [];
        req.incomingFiles.push({stream, path: dest});

        stream.on('error', cb);
        stream.on('finish', () => {

            // Provide same props as multers storage engine
            cb(null, {
                filename: path.basename(dest),
                destination: path.dirname(dest),
                path: dest,
                size: stream.bytesWritten
            });
        });
    }

    _removeFile(req, file, cb) {
        fs.unlink(file.path, cb);
    }
}

module.exports = destination => new StorageEngine(destination);
