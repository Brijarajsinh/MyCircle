require('custom-env').env();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// const jquery_validation = require('jquery-validation');
var exHbs = require('express-handlebars');
var bodyParser = require('body-parser');
const moment = require('moment');
const helpers = require('handlebars-helpers')();

const userModel = require('./schema/userSchema');
const PostModel = require('./schema/postSchema');
const savedPostModel = require('./schema/savedPost');
const statisticsModel = require('./schema/statistics');


//Requiring Flash
const flash = require('connect-flash');
// global.md5 = require('md5');

//Requiring AUTH.JS file to authenticate Process
const auth = require('./helpers/auth');
const { log } = require('console');

//Declaring some common variable globally so it can use multiple time in different files
global.mongoose = require("mongoose");

require('./connection')();
var app = express();


app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json());


//also handlebar's inbuilt helper requires
const hbs = exHbs.create({
  extname: '.hbs',
  helpers: {
    ...helpers,
    dateConvert: function (date1) {
      return moment(date1).format('DD/MM/YYYY, h:mm a');
    },
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
  let error = req.flash("error");
  let success = req.flash("success");
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
app.use('/', require('./routes/index'));
app.use(auth.commonMiddleware);
app.use('/posts', require('./routes/posts'));

// app.use(function (req, res, next) {
//   res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
//   next();
// });
app.use('/report', require('./routes/report'));
// app.use('/save',require('./routes/savedPost'));
app.use('/users', require('./routes/users'));

var cron = require('node-cron');

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
