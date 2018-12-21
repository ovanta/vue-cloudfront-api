const mongoose = require('./db');

module.exports = mongoose.model('Node', {
    id: String,      // Unique id of node
    parent: String,  // Parent id
    lastModified: Number,   // Last modified timestamp
    type: String,    // 'folder' or 'file'
    name: String,    // Folder / filename,
    marked: Boolean, // If marked

    // File specific
    size: {
        required: false,
        type: Number
    },

    // Folder specific
    color: {
        required: false,
        type: String // Hex color
    }
});
