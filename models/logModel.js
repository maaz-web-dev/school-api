const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    actionType: {
        type: String,
        required: true,
        enum: ['Create', 'Update', 'Delete'], // Defines the type of action
    },
    entityType: {
        type: String,
        required: true,
        enum: ['Student', 'Fees', 'Class', 'Subject', 'GeneralInfo'], // Extend this list based on your entities
    },
    // entityId: {
    //     type: String,
    //     required: true,
    //     default: '',
    // },
    description: {
        type: String,
        required: true,
    },
    changes: {
        type: mongoose.Schema.Types.Mixed, // Stores a JSON object of the changes made
        required: false,
    },
    username: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
