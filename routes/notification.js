var express = require('express');
var router = express.Router();
const notificationModel = require('../schema/notificationSchema');


//GET API to get all notification of liked posts
router.get('/', async function (req, res, next) {
    try {
        var userId = new mongoose.Types.ObjectId(req.user._id);
        var notification = await notificationModel.find({
            "userID": userId,
            "isSeen": false
        },
            {
                "_id": 1,
                "description": 1,
                "isSeen": 1
            }).lean();
        let response = {
            type: "success",
            data: notification
        }
        res.send(response);
    }
    catch (err) {
        let response = {
            type: "error",
            message: err.toString()
        }
        res.send(response);
    }
})
//Delete API to update notification status from isSeen : false to isSeen : true
router.delete('/', async function (req, res, next) {
    try {
        var userId = new mongoose.Types.ObjectId(req.user._id);
        await notificationModel.updateOne({ "_id": req.body._id }, { $set: { "isSeen": true } });
        let count = await notificationModel.countDocuments({
            "userID": userId,
            "isSeen": false
        })
        let response = {
            type: "success",
            data:count,
            delete: req.body._id
        }
        console.log("API CALLED");
        res.send(response);
    }
    catch (err) {
        let response = {
            type: "error",
            message: err.toString()
        }
        res.send(response);
    }
});

module.exports = router;
