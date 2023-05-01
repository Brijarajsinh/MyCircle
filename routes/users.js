var express = require('express');
var router = express.Router();
const UserModel = require('../schema/userSchema');
const multer = require('multer');
var path = require('path');

//Storage for user profile picture
var storage = multer.diskStorage(
    {
        destination: 'public/images/user_images/',
        filename: function (req, file, cb) {
            cb(null, req.user.fname + path.extname(file.originalname));
        }
    });
var upload = multer({
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
        console.log("AJAX CALLED");
        let user_details = await UserModel.findOne({ _id: req.user._id });
        let response = {
            "type": 'success',
            "data": user_details
        }
        res.send(response, null, 2);
    } catch (error) {
        console.log("ERROR GENERATED");
        console.log(error);
        let response = {
            "type": "error",
            "message": error.toString()
        }
        res.send(JSON.stringify(response), null, 2);
    }
});

//PUT Route to edit user details
router.put('/', upload.single('files'), async function (req, res, next) {
    try {
        let updated_details = {
            "fname": req.body.fname,
            "lname": req.body.lname,
            "email": req.body.email,
            "gender": req.body.gender
        }
        if (req.file){
            req.session.passport.user.profile = req.user.fname + path.extname(req.file.originalname);
            updated_details.profile = req.user.fname + path.extname(req.file.originalname)
        } 
        await UserModel.updateOne({ _id: req.user._id }, {
            $set: updated_details
        });
        res.locals.user = req.user;
        let response = {
            type: 'success'
        }
        res.send(response);
    } catch (error) {
        console.log("Error Generated IN EDIT user-details process")
        console.log(error);
        let response = {
            type: 'error',
            message: error.toString()
        }
        res.send(response)
    }
    res.send();
});

module.exports = router;