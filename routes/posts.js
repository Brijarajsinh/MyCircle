var express = require('express');
var router = express.Router();
const PostModel = require('../schema/postSchema');
const notificationModel = require('../schema/notificationSchema');
const savedPostModel = require('../schema/savedPost');
const likedPostModel = require('../schema/likes');
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
        if(req.user.isVerified){
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
        }
        else{
            let response = {
                type: 'error'
            }
            res.send(response)
        }
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
        const postId = new mongoose.Types.ObjectId(req.body.postId);
        let post_detail = await PostModel.findOne({ _id: postId });
        let response = {
            type: 'success',
            id: postId,
            data: post_detail
        }
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
        const postId = new mongoose.Types.ObjectId(req.body.postId);
        let updated_posts = {
            "title": req.body.title,
            "description": req.body.description
        }
        if (req.file) {
            updated_posts.postImage = req.file.filename;
        }
        await PostModel.updateOne({
            _id: postId, isArchived: false
        }, { $set: updated_posts });

        let response = {
            type: 'success',
            id: postId
        }
        if (req.file) {
            response.image = updated_posts
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
                type: 'error',
                id: postId,
                message: "Post Unsaved Successfully"
            }
            res.send(response);
        }
        else {
            let createdBy = await PostModel.findOne({
                _id: postId
            }, {
                "_id": 0, "user_id": 1
            });
            let savedPostDetails = new savedPostModel({
                "postID": postId,
                "userID": req.user._id,
                "createdBy": createdBy.user_id
            })
            await savedPostDetails.save();
            const response = {
                type: 'success',
                id: postId,
                message: "Post Saved Successfully"
            }
            if (createdBy.user_id != req.user._id) {
                let notificationDetails = new notificationModel({
                    "userID": new mongoose.Types.ObjectId(createdBy.user_id),
                    "description": req.user.fname + ' saved your post'
                });
                await notificationDetails.save();
                io.to(createdBy.user_id.toString()).emit('saved', {
                    'userNAME': req.user.fname
                });
            }
            res.send(response);
        }
    } catch (error) {
        console.log("Error generated during user saves this post")
        console.log(error);
        let response = {
            type: 'error',
            message: error.toString()
        }
        res.send(response);
    }
})

router.post('/like', async function (req, res, next) {
    try {
        let { postId, createdBy } = req.body;
        const liked = await likedPostModel.countDocuments({ postID: { $eq: postId }, userID: { $eq: req.user._id } });
        if (liked) {
            await likedPostModel.deleteOne({ postID: { $eq: postId }, userID: { $eq: req.user._id } });
            const response = {
                type: 'error',
                id: postId,
                createdBy: createdBy,
                message: "Disliked"
            }
            res.send(response);
        }
        else {
            let likedPostDetails = new likedPostModel({
                "postID": postId,
                "userID": req.user._id,
                "createdBy": createdBy
            })
            await likedPostDetails.save();
            const response = {
                type: 'success',
                id: postId,
                createdBy: createdBy,
                message: "Liked"
            }
            if (createdBy != req.user._id) {
                let notificationDetails = new notificationModel({
                    "userID": createdBy,
                    "description": req.user.fname + ' Liked your post'
                });
                await notificationDetails.save();
                io.to(createdBy).emit('liked', {
                    'userNAME': req.user.fname
                });
            }
            res.send(response);
        }
    }
    catch (error) {
        console.log(error);
        let response = {
            type: "error",
            message: error.toString()
        }
        res.send(response);
    }
});

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
                id: postId,
                message: 'Post Remove from Archive list'
            }
            res.send(response);
        }
        else {
            await PostModel.updateOne({ _id: postId }, { isArchived: true });
            let response = {
                type: 'success',
                id: postId,
                message: 'Post Archived'
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
