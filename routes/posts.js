const express = require('express');
const router = express.Router();
const PostModel = require('../schema/postSchema');
const notificationModel = require('../schema/notificationSchema');
const savedPostModel = require('../schema/savedPost');
const likedPostModel = require('../schema/likes');
const { default: mongoose } = require('mongoose');
const multer = require('multer');
const path = require('path');
const { log } = require('console');
const postService = require('../services/post.services');
//Storage for user post image
const post_storage = multer.diskStorage({
    destination: 'public/images/posts/',
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const post = multer({
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

        //if logged-in user is verified than add post in db
        if (req.user.isVerified) {
            const postDetails = new PostModel({
                "title": req.body.title,
                "description": req.body.description,
                "user_id": req.user._id
            })
            if (req.file) {
                //if user wants to add post-image than add image in postDetails object
                postDetails.postImage = req.file.filename;
            }


            //save postDetails in db
            await postDetails.save();
            const response = {
                type: 'success'
            }
            res.send(response);
        }

        //else send error
        else {
            const response = {
                type: 'error'
            }
            res.send(response)
        }
    } catch (error) {
        console.log("Error Generated IN post process")
        console.log(error);
        const response = {
            type: 'error',
            message: error.toString()
        }
        res.send(response)
    }
    res.send();
});

//POST Route to pre-fill post details while editing the post
router.get('/:postId/edit', async function (req, res, next) {
    try {
        const postId = new mongoose.Types.ObjectId(req.params.postId);
        const postDetail = await PostModel.findOne({ _id: postId });
        let response = {
            type: 'success',
            id: postId,
            data: postDetail
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

//PUT Route to edit posts details
router.put('/:postId/edit', post.single('files'), async function (req, res, next) {
    try {
        const postId = new mongoose.Types.ObjectId(req.params.postId);
        const updatedPost = {
            "title": req.body.title,
            "description": req.body.description
        }

        const response = {
            type: 'success',
            id: postId
        }

        if (req.file) {
            //if user wants to edit post image add image in updatedPost object
            updatedPost.postImage = req.file.filename;
            response.image = updatedPost.postImage
        }

        //update postDetails in collection
        await PostModel.updateOne({
            _id: postId, isArchived: false
        }, { $set: updatedPost });
        res.send(response);
    } catch (error) {
        console.log(error);
        console.log("Error Generated while editing post details");
        const response = {
            type: 'error',
            message: error.toString()
        }
        res.send(response);
    }
});

//POST Route to save post by current user
router.post('/:postId/save', async function (req, res, next) {
    try {
        const postId = req.params.postId;
        const saved = await savedPostModel.countDocuments({ postID: { $eq: postId }, userID: { $eq: req.user._id } });
        if (saved) {
            //if post is already saved than un-save it and delete from savedPost collection
            await savedPostModel.deleteOne({ postID: { $eq: postId }, userID: { $eq: req.user._id } });
            const response = {
                type: 'error',
                id: postId,
                message: "Post Unsaved Successfully"
            }
            res.send(response);
        }
        else {

            //Otherwise save post and store in savedPost collection
            const createdBy = await PostModel.findOne({
                _id: postId
            }, {
                "_id": 0, "user_id": 1
            });
            const savedPostDetails = new savedPostModel({
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
            const notificationDetails = new notificationModel({
                "userID": new mongoose.Types.ObjectId(createdBy.user_id),
                "description": req.user.fname + ' saved your post'
            });

            //save notification of post save in notification collection
            await notificationDetails.save();

            //using socket.io send notification to the user that created a post which is saved by current logged-in user
            io.to(createdBy.user_id.toString()).emit('saved', {
                'userName': req.user.fname
            });
            res.send(response);
        }
    } catch (error) {
        console.log("Error generated during user saves this post")
        console.log(error);
        const response = {
            type: 'error',
            message: error.toString()
        }
        res.send(response);
    }
})


//POST route to like post
router.post('/:postId/:createdBy/like', async function (req, res, next) {
    try {
        let { postId, createdBy } = req.params;
        const liked = await likedPostModel.countDocuments({ postID: { $eq: postId }, userID: { $eq: req.user._id } });
        if (liked) {

            //if post is liked than dislike it and delete from likedPost collection
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

            //else like the post and store in likedPost collection
            const likedPostDetails = new likedPostModel({
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
                const notificationDetails = new notificationModel({
                    "userID": createdBy,
                    "description": req.user.fname + ' Liked your post'
                });
                //save details in database
                await notificationDetails.save();

                //using socket.io let the user that created post which is liked by current logged-in user
                io.to(createdBy).emit('liked', {
                    'userName': req.user.fname
                });
            }
            res.send(response);
        }
    }
    catch (error) {
        console.log(error);
        const response = {
            type: "error",
            message: error.toString()
        }
        res.send(response);
    }
});

//DELETE Route to archive post
router.delete('/:postId/archive', async function (req, res, next) {
    try {

        const postId = new mongoose.Types.ObjectId(req.params.postId);
        const archived = await PostModel.countDocuments({ _id: { $eq: postId }, user_id: { $eq: req.user._id }, "isArchived": true });
        if (archived) {
            //if post is already archived than remove from archive list by updating in db
            //from isArchived true to isArchived false
            await PostModel.updateOne({ _id: postId }, { isArchived: false });
            const response = {
                type: 'error',
                id: postId,
                message: 'Post Remove from Archive list'
            }
            res.send(response);
        }
        else {

            //else set flag of post isArchived true in database
            await PostModel.updateOne({ _id: postId }, { isArchived: true });
            const response = {
                type: 'success',
                id: postId,
                message: 'Post Archived'
            }
            res.send(response);
        }
    } catch (error) {
        console.log(error);
        const response = {
            type: 'error',
            message: error.toString()
        }
        res.send(response);
    }
});
module.exports = router;
