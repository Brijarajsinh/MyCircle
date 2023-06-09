const { default: mongoose } = require("mongoose")
const option = {
    timestamps : true
}
const notificationSchema = new mongoose.Schema({
    isSeen:{
        type : Boolean,
        default: false,
    },
    userID:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    description:{
        type: String,
        required:true
    }
},option);

//Creating notification model to manage notification of user (UserWise)
const notificationModel = mongoose.model('notifications', notificationSchema);
module.exports = notificationModel;