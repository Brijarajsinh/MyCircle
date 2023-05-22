var express = require('express');
var router = express.Router();
const UserModel = require('../schema/userSchema');
const { default: mongoose } = require('mongoose');
const messagesModel = require('../schema/messagesSchema');

router.get('/get', async function (req, res, next) {
    try {
        let senderID = new mongoose.Types.ObjectId(req.user._id);
        let find = {}
        let project = {
            "senderID": 1,
            "receiverID": 1,
            "content": 1,
            "isRead": 1
        }
        if (req.query.receiver) {
            let receiverID = new mongoose.Types.ObjectId(req.query.receiver);
            //find.receiverID = receiverID;
            // find.receiverID = senderID;
            find["$or"] = [
                { receiverID: receiverID },
                { senderID: receiverID }
            ]
            await messagesModel.updateMany({
                "receiverID": senderID,
                "senderID": receiverID
            },
                { $set: { isRead: "true" } })
        }
        else {
            find.receiverID = senderID;
            find.isRead = false
        }
        let result = await messagesModel.find(find, project).sort({ "createdAt": -1 }).lean();

        let count = await messagesModel.countDocuments(find);

        let response = {
            type: 'success',
            message: "SUCCESSFULLY FETCHED ALL MESSAGES",
            data: result,
            currentUSER: req.user._id,
            count: count
        }
        if (req.query.receiver) {
            console.log("RESULT RESULT RESULT");
            console.log(result);
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
        const senderID = new mongoose.Types.ObjectId(req.user._id);
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
            'sender': req.user._id,
            'receiver': req.body.receiver,
            'currentUSER': req.user._id
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

        find._id = {
            $ne: userID
        }


        console.log("SEARCH SEARCH SEARCH SEARCH SEARCH SEARCH");
        console.log(req.query.search);
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
                                            { $eq: ["$senderID", "$$id"] },
                                            { $eq: ["isRead", false] }
                                        ]
                                }
                            }
                        }
                    ],
                    as: "message"
                },

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