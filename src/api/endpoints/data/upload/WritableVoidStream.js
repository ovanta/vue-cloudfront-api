const stream = require('stream');

class WritableVoidStream extends stream.Writable {

    constructor() {
        super();
        this.bytesWritten = 0;
    }

    _write(chunk, enc, next) {
        this.bytesWritten += chunk.length;
        next();
    }
}

module.exports = WritableVoidStream;
