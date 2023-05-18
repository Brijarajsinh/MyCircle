const notificationModel = require('../schema/notificationSchema');
var express = require('express');
var router = express.Router();
//GET API to get all notification of liked posts and saved posts by other users
router.get('/', async function (req, res, next) {
    try {
        var notification = await notificationModel.find({
            "userID": req.user._id,
            "isSeen": false
        },
            {
                "_id": 1,
                "description": 1,
                "isSeen": 1
            }
        ).sort({ _id: -1 }).lean();
        res.render("partials/notification", { notifications: notification, layout: 'blank' });
    }
    catch (err) {
        let response = {
            type: "error",
            message: err.toString()
        }
        res.send(response);
    }
})

//PUT API to update notification status from isSeen : false to isSeen : true
router.put('/', async function (req, res, next) {
    try {
        await notificationModel.updateOne({ "_id": req.body._id }, { $set: { "isSeen": true } });

        let count = await notificationModel.countDocuments({ "userID": req.user._id, "isSeen": false })
        let response = {
            type: "success",
            count: count,
            deleted: req.body._id
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
});

module.exports = router;
