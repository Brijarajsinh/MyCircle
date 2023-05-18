const { default: mongoose } = require("mongoose")
const option = {
    timestamps: true
}
const messagesSchema = new mongoose.Schema({
    senderID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    receiverID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, option);

const messagesModel = mongoose.model('messages', messagesSchema);
module.exports = messagesModel;