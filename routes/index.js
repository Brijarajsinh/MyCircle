var express = require('express');
var router = express.Router();
const UserModel = require('../schema/userSchema');
const PostModel = require('../schema/postSchema');
const statisticsModel = require('../schema/statistics');
const savedPostModel = require('../schema/savedPost');
const { default: mongoose } = require('mongoose');
var mailer = require('../mailer');
const md5 = require('md5');
const passport = require('passport');






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
router.get('/verify', async function (req, res, next) {
  try {
    console.log("VERIFY CALLED");
    if (req.query.email) {
      let verifyAttempt = await UserModel.findOne({"email": req.query.email,"isVerified": false},{
        "verifyAttempt":1
      });
      if(verifyAttempt <= 3){
        verifyAttempt++;
        await UserModel.updateOne(
          { "email": req.query.email },
          { $set: { "isVerified": true,"verifyAttempt": verifyAttempt} }
        );
      }
      else{
        
      }
      res.redirect('/login');
    }
    else {
      res.send('/');
    }
  } catch (error) {
    console.log(error.toString());
  }
})



//GET Route to render Registration Page
router.get('/registration', function (req, res, next) {
  res.render('registration', { title: 'Registration', layout: "before-login" });
});


//GET Route to Logout user and clearing student details from browser's cookies
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
    if (req.query.sortOrder) {
      if (req.query.sort == 'title') {
        sort.title = 1
      }
      else {
        sort._id = 1
      }
    }
    else {
      if (req.query.sort == 'title') {
        sort.title = -1
      }
      else {
        sort._id = -1
      }
    }
    // sort.collation = { locale: "en_US", caseFirst: "upper" } 
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

    const query = [
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
      }, {
        $sort: sort
      },
      { $skip: skip },
      { $limit: limit },
    ]
    let posts = await PostModel.aggregate(query, { collation: { locale: "en_US", caseFirst: "upper" } });
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

//POST Route to store user details in users collection
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
        html: `<h1>You are registered Successfully in MyCircle web Application<h1><br>
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