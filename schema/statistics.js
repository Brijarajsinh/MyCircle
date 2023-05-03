const { default: mongoose } = require("mongoose")

const option = {
    timestamps : true
}

const statistics = new mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    totalCreatedPost:{
        type:Number,
        required:true
    },
    totalSavedPost:{
        type:Number,
        required:true
    },
    savedPost:{
        type:Number,
        required:true
    }
},option);

const statisticsModel = mongoose.model('statistics', statistics);
module.exports = statisticsModel;