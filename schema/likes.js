const { default: mongoose } = require("mongoose")
const option = {
    timestamps : true
}
const likedPostSchema = new mongoose.Schema({
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
const likedPostModel = mongoose.model('likedPost', likedPostSchema);
module.exports = likedPostModel;