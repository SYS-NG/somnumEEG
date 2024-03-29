const mongoose = require("mongoose");
const DataSchema = new mongoose.Schema({
    sessionID: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
    },
    eegChannel: {
        type: String,
        required: true,
    },
    deviceName: {
        type: String,
        required: true
    },
    eegData: {
        type: [Number],
        required: true
    }
});
module.exports = mongoose.model("test_eeg", DataSchema);