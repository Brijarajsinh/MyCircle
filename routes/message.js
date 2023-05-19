var express = require('express');
var router = express.Router();
const UserModel = require('../schema/userSchema');
const { default: mongoose } = require('mongoose');
const messagesModel = require('../schema/messagesSchema');


router.get('/get', async function (req, res, next) {
    try {
        let find = {
            "senderID": new mongoose.Types.ObjectId(req.user._id),
            "isRead": false
        }
        let project = {
            "senderID": 1,
            "receiverID": 1,
            "content": 1,
        }
        if (req.query.receiver) {
            let receiverID = new mongoose.Types.ObjectId(req.query.receiver);
            find.receiverID = receiverID;
            await messagesModel.updateMany({
                "senderID": senderID,
                "receiverID": receiverID
            },
                { $set: { isRead: "true" } })
        }
        // else if (req.query.opened){
        //     find.
        // }
        const query = [
            {
                $match: find
            },
            {
                $project: project
            }
        ]
        let result = await messagesModel.aggregate(query);
        let count = await messagesModel.countDocuments({
            "receiverID": req.user._id
        });
        let response = {
            type: 'success',
            message: "SUCCESSFULLY FETCHED ALL MESSAGES",
            data: result,
            count: count
        }
        res.send(response);
    } catch (error) {
        console.log("Error Generated While Fetching Message which are not read yet");
        console.log(error);
        let response = {
            type: 'error'
        }
        res.send(response);
    }
});

//POST API to store message in messages collection
router.post('/', async function (req, res, next) {
    try {
        console.log("Message Will store in database soon");
        const senderID = new mongoose.Types.ObjectId(req.body.sender);
        const receiverID = new mongoose.Types.ObjectId(req.body.receiver);
        const content = req.body.content;

        let message = new messagesModel({
            "senderID": senderID,
            "receiverID": receiverID,
            "content": content
        });

        await message.save();
        io.to(req.body.receiver.toString()).emit('message', {
            'content': content,
            'sender': req.body.sender,
            'receiver': req.body.receiver
        });

        let response = {
            type: 'success',
            message: 'Message Sent Successfully'
        }
        res.send(response);
    } catch (error) {
        console.log("Error Generated While Sending Message");
        console, log(error);
        let response = {
            type: 'error'
        }
        res.send(response);
    }
});

router.get('/', async function (req, res, next) {
    try {
        let userID = new mongoose.Types.ObjectId(req.user._id);
        let find = {}
        if (req.query.search) {
            find.$or = [
                {
                    "fname": {
                        $regex: req.query.search
                    }
                },
                {
                    "lname": {
                        $regex: req.query.search
                    }
                },
                {
                    "fullName": {
                        $regex: req.query.search
                    }
                }
            ]
        }
        else {
            find._id = {
                $ne: userID
            }
        }
        find.isVerified = {
            $eq: true
        }
        let user = await UserModel.aggregate([
            {
                $match: find
            },
            {
                $lookup: {
                    from: "messages",
                    let: { id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and:
                                        [
                                            { $eq: ["$receiverID", userID] },
                                            { $eq: ["$senderID", "$$id"] }
                                        ]
                                }
                            }
                        }],
                    as: "message"
                }
            },
            {
                $project: {
                    "_id": 1,
                    "fullName": 1,
                    "profile": 1,
                    "count": { $size: "$message" },
                }
            },
            { $sort: { createdAt: 1 } }
        ])
        if (req.xhr) {
            res.render("partials/message", {
                title: 'Messages',
                users: user,
                layout: 'blank'

            });
        }
        else {
            res.render('message', {
                title: 'Messages',
                users: user
            });
        }
    } catch (error) {
        console.log("ERROR GENERATED HERE");
        console.log(error);
    }

});
module.exports = router;