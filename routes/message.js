const express = require('express');
const router = express.Router();
const UserModel = require('../schema/userSchema');
const { default: mongoose } = require('mongoose');
const messagesModel = require('../schema/messagesSchema');


//GET Route to get all messaged
router.get('/:receiver/get', async function (req, res, next) {
    try {
        const senderID = new mongoose.Types.ObjectId(req.user._id);
        const find = {}
        const project = {
            "senderID": 1,
            "receiverID": 1,
            "content": 1,
            "isRead": 1
        }
        if (req.params.receiver) {
            //if receiver passed in query string than finds only receiver's messages
            const receiverID = new mongoose.Types.ObjectId(req.params.receiver);
            find["$or"] = [
                { receiverID: receiverID },
                { senderID: receiverID }
            ]
            //at the time of fetching previous messages mark them as read
            await messagesModel.updateMany({
                "receiverID": senderID,
                "senderID": receiverID
            },
                { $set: { isRead: "true" } });
        }
        else {

            //if receiver not passed in query string than finds only received messages of current logged in user
            find.receiverID = senderID;
            find.isRead = false
        }

        //result holds the array of messages
        const result = await messagesModel.find(find, project).sort({ "createdAt": 1 }).lean();

        //count consist total number of messges that are unread still now
        const count = await messagesModel.countDocuments(find);
        const response = {
            type: 'success',
            message: "SUCCESSFULLY FETCHED ALL MESSAGES",
            data: result,
            currentUSER: req.user._id,
            count: count
        }
        res.send(response);
    } catch (error) {
        console.log("Error Generated While Fetching Message which are not read yet");
        console.log(error);
        const response = {
            type: 'error'
        }
        res.send(response);
    }
});

//put route to update message flag from isRead false to true
router.put('/:sender/read', async function (req, res, next) {
    try {

        const receiverID = new mongoose.Types.ObjectId(req.user._id);
        const senderID = new mongoose.Types.ObjectId(req.query.sender);
        //update all received messages of current logged-in user sent by req.query.sender as isRead:true
        await messagesModel.updateMany({
            "receiverID": receiverID,
            "senderID": senderID
        },
            { $set: { isRead: "true" } });
        const response = {
            type: 'success'
        }
        res.send(response);
    } catch (error) {
        console.log("Error Generated While updating message flag");
        res.send({
            type: 'error',
            message: error.toString()
        })
    }
})

//POST API to store message in messages collection
router.post('/', async function (req, res, next) {
    try {
        const senderID = new mongoose.Types.ObjectId(req.user._id);
        const receiverID = new mongoose.Types.ObjectId(req.body.receiver);
        const content = req.body.content;

        const message = new messagesModel({
            "senderID": senderID,
            "receiverID": receiverID,
            "content": content
        });
        //store message-details in db with sender,receiver and content
        await message.save();

        //using socket.io let the receiver know that someone sent message to him/her
        io.to(req.body.receiver.toString()).emit('message', {
            'content': content,
            'sender': req.user._id,
            'receiver': req.body.receiver,
            'currentUSER': req.user._id
        });

        const response = {
            type: 'success',
            message: 'Message Sent Successfully'
        }
        res.send(response);
    } catch (error) {
        console.log("Error Generated While Sending Message");
        console, log(error);
        const response = {
            type: 'error'
        }
        res.send(response);
    }
});

//GET Route to get count of all messages and chats if user is verified
router.get('/', async function (req, res, next) {
    try {
        if (req.user.isVerified) {
            const userID = new mongoose.Types.ObjectId(req.user._id);
            const find = {}
            find._id = {
                $ne: userID
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
                                                { $eq: ["$senderID", "$$id"] },
                                                { $eq: ["$isRead", false] }
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
                res.send({
                    type: 'success',
                    data: user
                })
            }
            else {
                res.render('partials/message', {
                    title: 'Messages',
                    users: user
                });
            }
        }
        else {
            res.send({
                type: 'error'
            })
        }
    } catch (error) {
        console.log("ERROR GENERATED HERE");
        console.log(error);
        res.send(
            {
                type: 'error',
                status: 401,
                message: error.toString()
            }
        );
    }
});
module.exports = router;