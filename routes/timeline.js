// var express = require('express');
// var router = express.Router();
// const UserModel = require('../schema/userSchema');
// const PostModel = require('../schema/postSchema');
// const { log } = require('handlebars');

// router.get('/', async function (req, res, next) {

// // res.render('/')

//     try {
//         let find = {
//             isArchived: false,
//         }
//         if (req.user) {
//             res.locals.user = req.user;
//             const userId = new mongoose.Types.ObjectId(req.user._id);
//             if (req.query.filter == 'others') {
//                 find.user_id = {
//                     $ne: userId
//                 }
//             }
//             else if (req.query.filter == 'minePosts') {
//                 find.user_id = {
//                     $eq: userId
//                 }
//             }
//             // else if(req.query.filter == 'saved'){
//             //     find.user_id = {
//             //         $eq: userId
//             //       }
//             // }
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
//                                     $and: [
//                                         { $eq: ["$postID", "$$postID"] },
//                                         // { $eq: ["$userID", userId] }
//                                     ]
//                                 }
//                             }
//                         }
//                     ],
//                     as: "saved"
//                 }
//             },
//             // { $unwind: "$user" }
//         ]);
//         if (req.user) {
//             console.log(posts);
//             // console.log(posts.user);
//             res.render("partials/posts/list", { posts: posts, });
//         }
//         else {
//             console.log(posts);
//             // console.log(posts.user);
//             res.render('timeline', { posts: posts });
//         }
//     } catch (error) {
//         console.log(error);
//         let response = {
//             type: 'error',
//             message: "Error Generated in filtering data"
//         }
//         res.send(response);
//     }

// });

// module.exports = router;
