var express = require('express');
var router = express.Router();
const UserModel = require('../schema/userSchema');
const { default: mongoose } = require('mongoose');


router.get('/get', async function (req, res, next) {

});

router.post('/', async function (req, res, next) {
    try {
        console.log("Message Will store in database soon");
        let response = {
            type: 'success',
            message:'Message Sent Successfully'
        }
        res.send(response);
    } catch (error) {
        let response = {
            type: 'error'
        }
        res.send(response);
    }
});

router.get('/', async function (req, res, next) {
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
    let user = await UserModel.aggregate([
        {
            $match: find
        },
        {
            $project: {
                "_id": 1,
                "fullName": 1,
                "profile": 1
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
});
module.exports = router;