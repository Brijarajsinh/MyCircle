const { default: mongoose } = require("mongoose")

const option = {
    timestamps : true
}
const collation = {
    'locale': 'en_US',
    'strength': 1,
  }
const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        maxLength: 30
    },
    description:{
        type:String,
        maxLength: 300
    },
    postImage:{
        type:String
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    isArchived:{
        type : Boolean,
        default: false,
    }
},option,collation);

const PostModel = mongoose.model('posts', postSchema);
module.exports = PostModel;