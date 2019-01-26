const fs = require('graceful-fs');
const path = require('path');
const WritableVoidStream = require('./WritableVoidStream');

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

        // Create file
        fs.closeSync(fs.openSync(dest, 'w'));

        // Create void stream if in demo mode
        const stream = _config.demo ? new WritableVoidStream() : fs.createWriteStream(dest);

        // Save stream and filepath to request object
        req.incomingFiles = req.incomingFiles || [];
        req.incomingFiles.push({stream: stream, path: dest});

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

        file.stream.pipe(stream);
    }

    _removeFile(req, file, cb) {
        fs.unlink(file.path, cb);
    }
}

module.exports = destination => new StorageEngine(destination);
