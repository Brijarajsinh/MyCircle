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

//GET Route to show all posts in timeline page
// router.get('/', async function (req, res, next) {
//     try {
//         console.log("APPLICATION STARTED.....");
//         let page_skip = (Number(req.query.page)) ? Number(req.query.page) : 1;
//         let limit = 3;
//         let skip = (page_skip - 1) * limit
//         //SORTING
//         let sort = {};
//         if (req.query.sort == 'title') {
//             sort.title = 1
//         }
//         sort._id = -1;
//         // else if (req.query.sort == 'date') {
//         //     sort.createdAt = 1
//         // }
//         let find = {}
//         if (req.user) {
//             const userId = new mongoose.Types.ObjectId(req.user._id);
//         }
//         //SEARCHING Posts by 
//         if (req.query.search) {
//             find.$or = [
//                 {
//                     "title": {
//                         $regex: req.query.search, $options: "i"
//                     }
//                 },
//                 {
//                     "description": {
//                         $regex: req.query.search, $options: "i"
//                     }
//                 }
//             ]
//         }
//         let archived = false;

//         //ARCHIVED POSTS only
//         if (req.query.arch) {
//             find.isArchived = {
//                 $eq: true
//             }
//             find.user_id = {
//                 $eq: userId
//             }
//             archived = true;
//         }
//         else {
//             find.isArchived = {
//                 $eq: false
//             }
//         }

//         //FILTERING
//         if (req.query.filter == 'others') {
//             find.user_id = {
//                 $ne: userId
//             }
//         } else if (req.query.filter == 'minePosts') {
//             find.user_id = {
//                 $eq: userId
//             }
//         } else if (req.query.filter == 'saved') {
//             let savedPostIds = await savedPostModel.distinct('postID', {
//                 userID: userId
//             });
//             find._id = {
//                 $in: savedPostIds
//             }
//         } else if (req.query.filter == 'allPosts') {
//             find.isArchived = {
//                 $eq: false
//             }
//         }
//         let posts = await PostModel.aggregate([
//             {
//                 $match: find
//             },
//             {
//                 $lookup: {
//                     from: "users",
//                     let: { id: "$user_id" },
//                     pipeline: [
//                         {
//                             $match:
//                             {
//                                 $expr:
//                                     { $eq: ["$_id", "$$id"] },
//                             }
//                         },
//                         { $project: { _id: 1, fname: 1, lname: 1, profile: 1 } }
//                     ],
//                     as: "user"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "savedposts",
//                     let: { postID: "$_id" },
//                     pipeline: [
//                         {
//                             $match:
//                             {
//                                 $expr: {
//                                     // $and: [
//                                     // { $eq: ["$userID", userId] },
//                                     // {
//                                     $eq: ["$postID", "$$postID"]
//                                     // }
//                                     // ]
//                                 }
//                             }
//                         }
//                     ],
//                     as: "saved"
//                 }
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     title: 1,
//                     postImage: 1,
//                     description: 1,
//                     createdAt: 1,
//                     user: { $arrayElemAt: ["$user", 0] },
//                     saved: { $size: '$saved' }
//                 }
//             }, {
//                 $sort: sort
//             },
//             { $skip: skip },
//             { $limit: limit }
//         ]);
//         let totalPosts = await PostModel.countDocuments(
//             find
//         );
//         let pageCount = Math.ceil(totalPosts / 3);
//         let page = [];
//         for (let i = 1; i <= pageCount; i++) {
//             page.push(i);
//         }
//         console.log(req.user);
//         if (req.user && req.user._id) {
//             console.log("PARTIAL through");
//             res.render("partials/posts/list", { posts: posts, layout: 'blank', archived: archived, page: page });
//         }
//         else {
//             console.log("MAIN PAGE");
//             res.render('timeline', { title: 'Timeline', posts: posts, page: page });
//         }


//     } catch (error) {
//         console.log(error);
//         let response = {
//             type: 'error',
//             message: "Error Generated While SHOWING data"
//         }
//         res.send(response);
//     }
// });
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
            let savedPostDetails = new savedPostModel({
                "postID": postId,
                "userID": req.user._id,
            })
            await savedPostDetails.save();
            const response = {
                type: 'success',
                message: "Post Saved Successfully"
            }
            res.send(response);
        }

    } catch (error) {
        console.log("Error generated during user  saves this post = postID", postId)
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
