const { default: mongoose } = require("mongoose")

const option = {
    timestamps : true
}

const userSchema = new mongoose.Schema({
    fname:{
        type:String,
        required:true
    },
    lname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique: true
    },
    gender:{
        type:String,
        enum : ['male','female'],
        required:true
    },
    password:{
        type:String,
        required:true
    },
    profile:{
        type:String
    }
},option);

const UserModel = mongoose.model('users', userSchema);
module.exports = UserModel;