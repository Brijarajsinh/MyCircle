const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var cookieSession = require('cookie-session');
var session = require('express-session');
var cookieParser = require('cookie-parser');
const UserModel = require('../schema/userSchema');
const md5 = require('md5');
const { log } = require('handlebars');

module.exports = {

  //user login function to store user information in browser cookies from database
  login: function (app) {
    app.use(cookieSession({
      secret: "session",
      key: "abhH4re5Uf4Rd0KnddSsdf05f3V",
      maxAge: 24 * 60 * 60 * 1000
    }));
    app.use(session({
      secret: "abhH4re5Uf4Rd0KnddS05sdff3V",
      resave: true,
      saveUninitialized: true,
      maxAge: 24 * 60 * 60 * 1000,
      cookie: { secure: true }
    }))
    app.use(cookieParser());
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'pswd',
      passReqToCallback: true
    },
      /**function for login user
      * @param {string} username
      * @param {string} password
      * @param {Function} done
      * @return {[type]}
      */
      function (req, email, pswd, done) {

        //if user find than store user-details in browser cookie
        UserModel.findOne({
          'email': {
            $regex: '^' + email + '$',
            $options: 'i'
          },
          "password": md5(pswd)
        }, {
          _id: 1,
          fname: 1,
          lname: 1,
          gender: 1,
          password: 1,
          email: 1,
          profile: 1,
          isVerified: 1,
          fullName:1
        }).lean().then(async function (user) {
          // if user not found
          if (!user) {
            return done(null, false, {
              message: 'Please enter valid login details'
            });
          } else {
            return done(null, user);
          }
          // handle catch 
        }).catch(function (err) {
          return done(null, false, {
            message: err.toString()
          });
        });
      }
    ));
    passport.serializeUser(function (req, user, done) {
      console.log("serializeUser");
      //console.log(req.user);
      done(null, user);
    });
    passport.deserializeUser(function (req, user, done) {
      try {
        console.log("deserializeUser");
        // console.log(req.user);
        done(null, user);
      } catch (error) {
        console.log(error);
      }
    });
  },
  //function checks user is authenticated or not 
  // for purpose of restricting access other functionalities/routes without login
  commonMiddleware: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.redirect('/login');
  }
}