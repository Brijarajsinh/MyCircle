const { default: mongoose } = require("mongoose")
const option = {
    timestamps : true
}
const savedPostSchema = new mongoose.Schema({
    postID:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    userID:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    }
},option);
const savedPostModel = mongoose.model('savedPost', savedPostSchema);
module.exports = savedPostModel;