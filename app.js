require('custom-env').env();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const exHbs = require('express-handlebars');
const bodyParser = require('body-parser');
const moment = require('moment');
const helpers = require('handlebars-helpers')();

//Requiring model of users,posts,savedPost to create report and statistics
const userModel = require('./schema/userSchema');
const PostModel = require('./schema/postSchema');
const savedPostModel = require('./schema/savedPost');
const statisticsModel = require('./schema/statistics');


//Requiring Flash
const flash = require('connect-flash');

//Requiring AUTH.JS file to authenticate Process
const auth = require('./helpers/auth');

//Declaring some common variable globally so it can use multiple time in different files
global.mongoose = require("mongoose");

//connecting application with database by requiring connection.js file
require('./connection')();
const app = express();


app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json());


//handlebar's inbuilt helper requiring
const hbs = exHbs.create({
  extname: '.hbs',
  helpers: {
    ...helpers,
    dateConvert: function (date1) {
      return moment(date1).format('DD/MM/YYYY, h:mm a');
    }
  }
});
// view engine setup
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.set('partials', path.join(__dirname, 'views'));
app.engine('hbs', hbs.engine);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

auth.login(app);
app.use(flash());
app.use((req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
  }
  const error = req.flash("error");
  const success = req.flash("success");
  if (success.length > 0) {
    res.locals.flash = {
      type: "success",
      message: success,
    };
  }
  if (error.length > 0) {
    res.locals.flash = {
      type: "error",
      message: error,
    };
  }
  return next();
});

//Landing/timeline page which will access by user without login

app.use('/', require('./routes/index'));
//commonMiddleware to check user is authenticated 

app.use(auth.commonMiddleware);


app.use('/posts', require('./routes/posts'));
app.use('/report', require('./routes/report'));
app.use('/users', require('./routes/users'));
app.use('/messages', require('./routes/message'));
app.use('/notification', require('./routes/notification'));


//assign cron job which store and update user activity at every Minute 
const cron = require('node-cron');
const { type } = require('os');

cron.schedule('*/1 * * * * *', async function (req, res) {
  const totalUser = await userModel.find({});
  for (const iterator of totalUser) {
    const totalCreatedPost = await PostModel.countDocuments({
      user_id: iterator._id,
      isArchived: false
    }
    );
    const totalSavedPost = await savedPostModel.countDocuments({
      userID: iterator._id
    });
    const totalSavedPostOthers = await savedPostModel.countDocuments({
      createdBy: {
        $eq: iterator._id
      }
    });
    const data = {
      user_id: iterator._id,
      totalCreatedPost: totalCreatedPost,
      totalSavedPost: totalSavedPost,
      savedPost: totalSavedPostOthers
    }
    await statisticsModel.updateOne({ user_id: iterator._id }, { $set: data }, { upsert: true })
  }
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
