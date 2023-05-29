const express = require('express');
const router = express.Router();
const UserModel = require('../schema/userSchema');
const PostModel = require('../schema/postSchema');
const statisticsModel = require('../schema/statistics');
const savedPostModel = require('../schema/savedPost');
const { default: mongoose } = require('mongoose');
const mailer = require('../mailer');
const passport = require('passport');
const getMail = require('../helpers/function');
const userService = require('../services/user.services');
const postService = require('../services/post.services');



//GET Route to render Registration Page
router.get('/registration', function (req, res, next) {
  res.render('registration', { title: 'Registration', layout: "before-login" });
});
/* GET home page. */

//GET Route to render LOGIN Page
router.get('/login',
  function (req, res, next) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next()
  },
  async function (req, res, next) {
    if (req.user) {
      res.redirect('/');
    }
    else {
      res.render('login', { title: 'Login', layout: "before-login" });
    }
  });

//Get route to verify user and update status from isVerified false to isVarified true
router.get('/verify', async function (req, res, next) {
  try {

    //if email pass in query parameter than update in db
    if (req.query.email) {
      await UserModel.updateOne(
        { "email": req.query.email },
        { $set: { "isVerified": true } }
      );
      //after update in db update browser side stored user-details
      req.session.passport.user.isVerified = true;

      //render middleware page that is Login if not already login otherwise main page
      res.render('verifyLogin', { title: 'Verification', layout: 'blank' });
    }
    //else send to landing page
    else {
      res.send('/');
    }
  } catch (error) {
    console.log(error.toString());
  }
})

//GET Route to Logout user and clearing user details from browser's cookies
router.get('/logout', function (req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next()
}, async function (req, res, next) {
  req.logOut();
  req.session = null;
  res.redirect("/");
})

//POST Route to Login Process of user
router.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err)
    }
    if (!user) {
      // *** Display message without using flash option
      // re-render the login form with a message
      req.flash('error', info.message);
      return res.redirect('/login');
    }
    req.logIn(user, async function (err) {
      if (err) {
        return next(err);
      }
      console.log("Log IN Successfully");
      res.redirect('/');
    });
  })(req, res, next);
});

//Displays all the posts with sorting,searching and pagination
router.get('/', function (req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next()
}, async function (req, res, next) {
  try {
    const page_skip = (Number(req.query.page)) ? Number(req.query.page) : 1;
    const limit = 6;
    const skip = (page_skip - 1) * limit;
    const userId = req.user
      //if user logged in than set userId to current logged in user's _id 
      ? new mongoose.Types.ObjectId(req.user._id)

      //else set userId to blank string
      : '';

    const statistics = req.user
      ? await statisticsModel.findOne({
        user_id: userId
      }).lean()
      : '';


    const query = [
      {
        $match: await postService.findObject(req, userId)
      },
      {
        $lookup: {
          from: "users",
          let: { id: "$user_id" },
          pipeline: [
            {
              $match:
              {
                $expr:
                  { $eq: ["$_id", "$$id"] },
              }
            },
            { $project: { id: 1, _id: 1, fname: 1, lname: 1, profile: 1, fullName: 1 } }
          ],
          as: "user"
        }
      },
      {
        $lookup: {
          from: "savedposts",
          let: { postID: "$_id" },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $and:
                    [
                      { $eq: ["$postID", "$$postID"] },
                      { $eq: ["$userID", userId] }
                    ]
                }
              }
            }
          ],
          as: "saved"
        }
      },
      {
        $lookup: {
          from: "likedposts",
          let: { postID: "$_id" },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $and:
                    [
                      { $eq: ["$postID", "$$postID"] },
                      { $eq: ["$userID", userId] }
                    ]
                }
              }
            }
          ],
          as: "liked"
        }
      }, {
        $lookup: {
          from: "likedposts",
          let: { postID: "$_id" },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $and:
                    [
                      { $eq: ["$postID", "$$postID"] },
                    ]
                }
              }
            }
          ],
          as: "count"
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          postImage: 1,
          description: 1,
          createdAt: 1,
          user_id: {
            $toString: "$user_id"
          },
          user: { $arrayElemAt: ["$user", 0] },
          saved: { $size: '$saved' },
          liked: { $size: '$liked' },
          likes: { $size: '$count' }
        }
      },
      {
        $sort: postService.sortPost(req.query.sort, req.query.sortOrder)
      },
      { $skip: skip },
      { $limit: limit },
    ]
    let posts = await PostModel.aggregate(query, { collation: { locale: "en_US", caseFirst: "upper" } });
    let totalPosts = await PostModel.countDocuments(
      await postService.findObject(req, userId)
    );




    const pageCount = Math.ceil(totalPosts / limit);
    const page = [];
    for (let i = 1; i <= pageCount; i++) {
      page.push(i);
    }
    if (req.xhr) {
      console.log("AJAX called");
      // console.log(posts);
      // console.log(page);
      res.render("partials/posts/list", { posts: posts, layout: 'blank', archived: archived, page: page, statistics: statistics });
    }
    else {
      console.log("AJAX not called");
      // console.log(posts);
      // console.log(page);
      // console.log(posts);
      res.render('timeline', { title: 'Timeline', posts: posts, page: page, statistics: statistics });
      // archived: archived,
    }
  } catch (error) {
    console.log(error);
    const response = {
      type: 'error',
      message: "Error Generated While SHOWING data"
    }
    res.send(response);
  }
});

//GET Route to check e-mail field's value is already registered or not

//this route is called using jquery validator method of remote
router.get('/check-email', async function (req, res, next) {
  const condition = {
    email: req.query.email
  }
  const exist = await UserModel.countDocuments(condition);
  //if e-mail is already registered than return false
  if (exist) return res.send(false);

  //else return true
  return res.send(true);
});


//POST Route to store user details in users collection
router.post('/registration', async function (req, res, next) {
  try {
    const userDetails = req.body;
    const exist = await UserModel.countDocuments({ email: userDetails.email });
    if (exist) {
      const response = {
        type: "error",
        message: "E-mail is already registered"
      }
      return res.send(response);
    }
    else {
      //send mail to register mail address for verification
      const info = mailer.sendMail(getMail.sendMail(userDetails.email));
      console.log(`Message Sent SuccessFully`);

      //creating newUser object which has user details
      const newUser = await new UserModel(userService.userRegistration(userDetails));;
      //stores user details in database
      await newUser.save();

      //after store in db store details in browser's cache and continue in timeline page
      req.logIn(newUser, async function (err) {
        if (err) {
          return next(err);
        }
        //set the local variable 'user' to access details of current logged in user
        console.log("Log IN Successfully");
        res.locals.user = req.user;
        res.send({
          type: 'success'
        });
      });
    }
  }
  catch (error) {
    console.log("Error Generated IN USER entry");
    console.log(error);
    const response = {
      type: "error",
      message: error.toString()
    }
    res.send(JSON.stringify(response), null, 2);
  }
});
module.exports = router;