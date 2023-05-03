var express = require('express');
var router = express.Router();
const PostModel = require('../schema/postSchema');
const UserModel = require('../schema/userSchema');
const savedPostModel = require('../schema/savedPost');
const { default: mongoose } = require('mongoose');
const multer = require('multer');
var path = require('path');
const { log } = require('console');

//Storage for user post image
var post_storage = multer.diskStorage({
    destination: 'public/images/posts/',
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
var post = multer({
    storage: post_storage, fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/gif" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
            cb(null, true);
        } else {
            return cb(null, false);
        }
    }
});

// POST Route to Save the POST in post collection
router.post('/', post.single('files'), async function (req, res, next) {
    try {
        console.log("POST ROUTE");
        let post_details = new PostModel({
            "title": req.body.title,
            "description": req.body.description,
            "user_id": req.user._id
        })
        if (req.file) {
            post_details.postImage = req.file.filename;
        }
        await post_details.save();
        let response = {
            type: 'success'
        }
        res.send(response);
    } catch (error) {
        console.log("Error Generated IN post process")
        console.log(error);
        let response = {
            type: 'error',
            message: error.toString()
        }
        res.send(response)
    }
    res.send();
});

//POST Route to pre-fill post details while editing the post
router.post('/edit', async function (req, res, next) {
    try {
        console.log("AJAX CALLED");
        const postId = new mongoose.Types.ObjectId(req.body.postId);
        let post_detail = await PostModel.findOne({ _id: postId });
        let response = {
            type: 'success',
            data: post_detail
        }
        console.log(response);
        res.send(response);
    } catch (error) {
        console.log(error);
        let response = {
            type: 'error',
            message: error.toString()
        }
        res.send(response);
    }
});

//PUT Route to edit posts contains
router.put('/', post.single('files'), async function (req, res, next) {
    try {
        let { postId } = req.body;
        let updated_posts = {
            "title": req.body.title,
            "description": req.body.description
        }
        if (req.file) updated_posts.postImage = req.file.filename;
        await PostModel.updateOne({
            _id: new mongoose.Types.ObjectId(postId), isArchived: false
        }, { $set: updated_posts });

        let response = {
            type: 'success'
        }
        res.send(response);
    } catch (error) {
        console.log(error);
        console.log("Error Generated while editing post details");
        let response = {
            type: 'error',
            message: error.toString()
        }
        res.send(response);
    }
});
     
//POST Route to save post by current user
router.post('/save', async function (req, res, next) {
    try {
        let { postId } = req.body;
        const saved = await savedPostModel.countDocuments({ postID: { $eq: postId }, userID: { $eq: req.user._id } });
        if (saved) {
            await savedPostModel.deleteOne({ postID: { $eq: postId }, userID: { $eq: req.user._id } });
            const response = {
                type: 'success',
                message: "Post Unsaved Successfully"
            }
            res.send(response);
        }
        else {
            let createdBy = await PostModel.findOne({
                _id:postId
            },{
                "_id":0,"user_id":1
            });
            let savedPostDetails = new savedPostModel({
                "postID": postId,
                "userID": req.user._id,
                "createdBy":createdBy.user_id
            })
            await savedPostDetails.save();
            const response = {
                type: 'success',
                message: "Post Saved Successfully"
            }
            res.send(response);
        }

    } catch (error) {
        console.log("Error generated during user  saves this post = postID")
        console.log(error);
        let response = {
            type: 'error',
            message: error.toString()
        }
        res.send(response);
    }
})


//DELETE Route to archive post
router.delete('/', async function (req, res, next) {
    try {
        let { postId } = req.body;
        postId = new mongoose.Types.ObjectId(postId);
        const archived = await PostModel.countDocuments({ _id: { $eq: postId }, user_id: { $eq: req.user._id }, "isArchived": true });
        if (archived) {
            await PostModel.updateOne({ _id: postId }, { isArchived: false });
            let response = {
                type: 'success',
                message: 'Post Remove from Archive list'
            }
            res.send(response);
        }
        else {
            await PostModel.updateOne({ _id: postId }, { isArchived: true });
            let response = {
                type: 'success',
                message: 'Post Archived Successfully'
            }
            res.send(response);
        }
    } catch (error) {
        console.log(error);
        let response = {
            type: 'error',
            message: error.toString()
        }
        res.send(response);
    }
});
module.exports = router;