var express = require('express');
var router = express.Router();
const UserModel = require('../schema/userSchema');
const PostModel = require('../schema/postSchema');
const statisticsModel = require('../schema/statistics');
const savedPostModel = require('../schema/savedPost');
const { default: mongoose } = require('mongoose');
const notificationModel = require('../schema/notificationSchema');
var mailer = require('../mailer');


const md5 = require('md5');
const passport = require('passport');


//GET API to get all notification of liked posts
router.get('/notification', async function (req, res, next) {
  try {
    var notification = await notificationModel.find({
      "userID": req.user._id,
      "isSeen": false
    },
      {
        "_id": 1,
        "description": 1,
        "isSeen": 1
      }).lean();
    res.render("partials/notification", { notifications: notification, layout: 'blank' });
  }
  catch (err) {
    let response = {
      type: "error",
      message: err.toString()
    }
    res.send(response);
  }
})

//PUT API to update notification status from isSeen : false to isSeen : true
router.put('/notification', async function (req, res, next) {

  try {
    await notificationModel.updateOne({ "_id": req.body._id }, { $set: { "isSeen": true } });

    let count = await notificationModel.countDocuments({ "userID": req.user._id, "isSeen": false })
    let response = {
      type: "success",
      count: count,
      deleted: req.body._id
    }
    res.send(response);
  }
  catch (err) {
    let response = {
      type: "error",
      message: err.toString()
    }
    res.send(response);
  }
});

/* GET home page. */
//GET Route to render LOGIN Page
router.get('/login', function (req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next()
}, function (req, res, next) {
  if (req.user) {
    return res.redirect('/');
  }
  else {
    if(req.status == 205){
      res.render('login', { title: 'Login', layout: "before-login",flag:true });
    }
    else{
      res.render('login', { title: 'Login', layout: "before-login" });

    }
  }
});

//GET Route to render Registration Page
router.get('/registration', function (req, res, next) {
  res.render('registration', { title: 'Registration', layout: "before-login" });
});

//GET Route to Logout user
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
      // user_id:req.user._id,
      res.redirect('/');
    });
  })(req, res, next);
});
//Displays all the posts
router.get('/', function (req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next()
}, async function (req, res, next) {
  try {
    let page_skip = (Number(req.query.page)) ? Number(req.query.page) : 1;
    let limit = 6;
    let skip = (page_skip - 1) * limit
    //SORTING
    let sort = {};
    if (req.query.sort == 'title') {
      sort.title = 1
      // ,
      //  sort.collation = { 'locale' : 'en_US' } 
    }
    sort._id = -1;
    let find = {}
    if (req.user) {
      var userId = new mongoose.Types.ObjectId(req.user._id);
      var statistics = await statisticsModel.findOne({
        user_id: userId
      }).lean();
    }
    //SEARCHING Posts by 
    if (req.query.search) {
      find.$or = [
        {
          "title": {
            $regex: req.query.search
            // , $options: "i"
          }
        },
        {
          "description": {
            $regex: req.query.search
            // , $options: "i"
          }
        }
      ]
    }
    let archived = false;

    //ARCHIVED POSTS only
    if (req.query.arch) {
      find.isArchived = {
        $eq: true
      }
      find.user_id = {
        $eq: userId
      }
      archived = true;
    }
    else {
      find.isArchived = {
        $eq: false
      }
    }

    //FILTERING
    if (req.query.filter == 'others') {
      find.user_id = {
        $ne: userId
      }
    } else if (req.query.filter == 'minePosts') {
      find.user_id = {
        $eq: userId
      }
    } else if (req.query.filter == 'saved') {
      let savedPostIds = await savedPostModel.distinct('postID', {
        userID: userId
      });
      find._id = {
        $in: savedPostIds
      }
    } else if (req.query.filter == 'allPosts') {
      find.isArchived = {
        $eq: false
      }
    }
    let posts = await PostModel.aggregate([
      {
        $match: find
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
            { $project: { id: 1, _id: 1, fname: 1, lname: 1, profile: 1 } }
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
      }, {
        $sort: sort
      },
      { $skip: skip },
      { $limit: limit }
    ]);
    let totalPosts = await PostModel.countDocuments(
      find
    );
    let pageCount = Math.ceil(totalPosts / limit);
    let page = [];
    for (let i = 1; i <= pageCount; i++) {
      page.push(i);
    }
    if (req.xhr) {
      console.log("AJAX called");
      // console.log(page);
      res.render("partials/posts/list", { posts: posts, layout: 'blank', archived: archived, page: page, statistics: statistics });
    }
    else {
      console.log("AJAX not called");
      // console.log(page);
      // console.log(posts);
      res.render('timeline', { title: 'Timeline', posts: posts, page: page, statistics: statistics });
      // archived: archived,
    }
  } catch (error) {
    console.log(error);
    let response = {
      type: 'error',
      message: "Error Generated While SHOWING data"
    }
    res.send(response);
  }
});
//GET Route to check e-mail field's value is already registered or not
router.get('/check-email', async function (req, res, next) {
  let condition = {
    email: req.query.email
  }
  let exist = await UserModel.countDocuments(condition);
  if (exist) return res.send(false);
  return res.send(true);
});

//POST Route to store user details in collection
router.post('/registration', async function (req, res, next) {
  try {
    user_details = req.body;
    let exist = await UserModel.countDocuments({ email: user_details.email });
    if (exist) {
      let response = {
        type: "error",
        message: "E-mail is already registered"
      }
      return res.send(response);
    }
    else {
      var info = mailer.sendMail({
        from: 'mahidabrijrajsinh2910@gmail.com', // sender address
        to: req.body.email, // list of receivers
        subject: 'Registration', // Subject line
        text: 'Registration Success',
        html: `<h1>You are registered Successfully<h1><br>
                      <h3>Remember Your Credentials that is something like this:</h3> <br>
                      <h4>E-mail ID:->"${req.body.email}"<br>
                      Password :-> ${req.body.password}</h4><br>
                      <h1>Thanks For Registration</h1><br>
                      <a href='http://localhost:3000/verify/?email=${req.body.email}&'>To Verify Your Account Please Click Here</a>
                      <h4> Click Here To Login:=> http://192.168.1.176:3000/login></h4>`
      });
      console.log(`Message Sent SuccessFully`);

      var new_user = new UserModel({
        "fname": user_details.fname,
        "lname": user_details.lname,
        "email": user_details.email,
        "gender": user_details.gender,
        "password": md5(user_details.password),
        "profile": "default_user.jpg"
      });
      await new_user.save();
      req.logIn(new_user, async function (err) {
        if (err) {
          return next(err);
        }
        console.log("Log IN Successfully");
        res.locals.user = req.user;
        // user_id:req.user._id,
        res.send({
          type: 'success'
        });
      });
    }

  }
  catch (error) {
    console.log("Error Generated IN USER entry");
    console.log(error);
    let response = {
      type: "error",
      message: error.toString()
    }
    res.send(JSON.stringify(response), null, 2);
  }
});
module.exports = router;