var express = require('express');
var router = express.Router();
const savedPostModel = require('../schema/savedPost');
router.post('/', async function (req, res, next) {
    try {
        let { postId } = req.body;
        console.log(postId);
        let savedPostDetails = new savedPostModel({
            "postID": postId,
            "userID": req.user._id,
        })
        await savedPostDetails.save();
        let response = {
            type: 'success'
        }
        res.send(response);
    } catch (error) {
        console.log("Error generated during save post")
        console.log(error);
        let response = {
            type: 'error',
            message: error.toString()
        }
        res.send(response);
    }
});
module.exports = router;
