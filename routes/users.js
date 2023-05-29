const express = require('express');
const router = express.Router();
const UserModel = require('../schema/userSchema');
const multer = require('multer');
const path = require('path');
const mailer = require('../mailer');
const commonFunction = require('../helpers/function');
const userService = require('../services/user.services');
//Storage for user profile picture
const storage = multer.diskStorage(
    {
        destination: 'public/images/user_images/',
        filename: function (req, file, cb) {
            cb(null, req.user.fname + path.extname(file.originalname));
        }
    });
const upload = multer({
    storage: storage, fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            return cb(null, false);
        }
    }
});

/* GET users listing. */

//GET Route to pre-fill user-details which will be edited
router.get('/edit', async function (req, res, next) {
    try {
        //returns all the details of current logged in user
        const userDetails = await UserModel.findOne({ _id: req.user._id });
        const response = {
            "type": 'success',
            "data": userDetails
        }
        res.send(response, null, 2);
    } catch (error) {
        console.log(error);
        const response = {
            "type": "error",
            "message": error.toString()
        }
        res.send(JSON.stringify(response), null, 2);
    }
});

//PUT Route to resend verification mail to the current logged in user
router.put('/resend-verify-mail', async function (req, res, next) {
    try {
        const verifyDetail = await UserModel.findOne(
            { email: req.user.email },
            {
                "_id": 0,
                "verifyAttempt": 1,
                "lastVerifyAttempt": 1,
                "isVerified": 1
            }
        )
        let attempt = verifyDetail.verifyAttempt;
        attempt++;
        const remainingTime = commonFunction.dateCompare(verifyDetail.lastVerifyAttempt);

        //if user already verified than
        if (verifyDetail.isVerified) {
            res.send({
                type: 'error',
                message: `You are already verified by MyCircle`
            });
        }
        //if user not verified and tries to send mail within minimum time specified
        else if (remainingTime < process.env.minuteCount) {
            res.send({
                type: 'error',
                message: `Please wait ${process.env.minuteCount-remainingTime} minute`
            });
        }
        //else if user reach to limit of sending verification mail than
        else if (attempt > process.env.attemptCount) {
            res.send({
                type: 'error',
                message: 'Maximum limit of sending mail is exceed'
            });
        }


        //if user is not verified,
        //and time limit is valid to resend mail,
        //and chance remaining to resend mail

        //than and only than re-send verification mail to user
        else {
            const info = mailer.sendMail(commonFunction.sendMail(req.user.email));
            console.log(`Message Sent SuccessFully`);
            //after resending mail to user update attempt count and last-sent-mail time in user collection
            await UserModel.updateOne(
                { email: req.user.email },
                {
                    "verifyAttempt": attempt
                }
            )

            //after updating in database update the attempt count in browser'cookies
            req.session.passport.user.verifyAttempt = attempt;
            res.send({
                type: 'success'
            });
        }
    } catch (error) {
        console.log("Error Generated IN Resending mail for verification process");
        console.log(error);
        const response = {
            type: 'error',
            message: error.toString()
        }
        res.send(response)
    }
})

//PUT Route to edit user details
router.put('/profile', upload.single('files'), async function (req, res, next) {
    try {
        //prepare Object to update details in user collection
        const updatedUser = userService.userProfileEdit(req.body);
        
        //update other user details of current logged in user in browser's cookie
        req.session.passport.user.fullName = `${updatedUser.fname} ${updatedUser.lname}`;
        req.session.passport.user.gender = updatedUser.gender;
        if (req.file) {
            //if user edits profile image than update the image of user in database and browser's cookie
            req.session.passport.user.profile = updatedUser.fname + path.extname(req.file.originalname);
            updatedUser.profile = updatedUser.fname + path.extname(req.file.originalname);
        }

        //updating in database
        await UserModel.updateOne({ _id: req.user._id }, {
            $set: updatedUser
        });

        //update other user details of current logged in user in browser's cookie
        const response = {
            type: 'success'
        }
        res.send(response);

    } catch (error) {
        console.log("Error Generated IN EDIT user-details process")
        console.log(error);
        const response = {
            type: 'error',
            message: error.toString()
        }
        res.send(response)
    }
    res.send();
});
module.exports = router;