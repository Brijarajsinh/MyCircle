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
        default:1
    },
    lastVerifyAttempt:{
        type:Date
    }
}, option);

userSchema.pre('save', async function (next) {
    const full_name = `${this.fname} ${this.lname}`;
    this.fullName = full_name;
    this.lastVerifyAttempt = `${this.createdAt}`;
    next();
})

userSchema.pre('updateOne', async function (next) {
    if (this._update["$set"].fname && this._update["$set"].lname) {
        const full_name = `${this._update["$set"].fname} ${this._update["$set"].lname}`;
        this._update["$set"].fullName = full_name;
    }
    if(this._update.verifyAttempt && this._update.$set.isVerified != true){
        this._update["$set"].lastVerifyAttempt = new Date();
    }
    next();
})
const UserModel = mongoose.model('users', userSchema);
module.exports = UserModel;