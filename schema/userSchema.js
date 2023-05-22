const { default: mongoose } = require("mongoose")
const option = {
    timestamps: true
}
const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    fullName: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profile: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verifyAttempt:{
        type:Number,
        default:0,
        max:2
    }
}, option);

userSchema.pre('save', async function (next) {
    let full_name = `${this.fname} ${this.lname}`;
    this.fullName = full_name;
    next();
})

userSchema.pre('updateOne', async function (next) {
    if (this._update["$set"].fname && this._update["$set"].lname) {
        let full_name = `${this._update["$set"].fname} ${this._update["$set"].lname}`;
        this._update["$set"].fullName = full_name;
    }
    next();
})
const UserModel = mongoose.model('users', userSchema);
module.exports = UserModel;