const notificationModel = require('../schema/notificationSchema');
const express = require('express');
const router = express.Router();

//GET API to get all notification of logged-in user (liked posts and saved posts of by other users)
router.get('/', async function (req, res, next) {
    try {
        const notification = await notificationModel.find({
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

//PUT API to update notification status from isSeen : false to true
router.put('/:id/read', async function (req, res, next) {
    try {
        await notificationModel.updateOne({ "_id": req.params.id }, { $set: { "isSeen": true } });
        const count = await notificationModel.countDocuments({ "userID": req.user._id, "isSeen": false })
        const response = {
            type: "success",
            count: count,
            deleted: req.body._id
        }
        res.send(response);
    }
    catch (err) {
        const response = {
            type: "error",
            message: err.toString()
        }
        res.send(response);
    }
});

module.exports = router;
