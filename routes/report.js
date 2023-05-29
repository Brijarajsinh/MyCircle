const express = require('express');
const router = express.Router();
const UserModel = require('../schema/userSchema');

//GET Route to show report
router.get('/', async function (req, res, next) {

  //if req.query.page consists than pagination applies in fetched records
  const find = {}
  const pageSkip = (Number(req.query.page)) ? Number(req.query.page) : 1;
  const limit = 3;
  const skip = (pageSkip - 1) * limit

//if req.query.search consists value than searching applied in fetched records
  if (req.query.search) {
    find.$or = [
      {
        "fname": {
          $regex: req.query.search
        }
      },
      {
        "lname": {
          $regex: req.query.search
        }
      },
      {
        "fullName": {
          $regex: req.query.search
        }
      },
      {
        "email": {
          $regex: req.query.search
        }
      }
    ]
  }

  //user object holds all details of all user except current logged-in user
  const user = await UserModel.aggregate([
    {
      $match: find
    },
    {
      $lookup: {
        from: "posts",
        let: { id: "$_id" },
        pipeline: [{
          $match: {
            $expr: {
              $and: [
                { $eq: ["$user_id", "$$id"] },
                { $eq: ["$isArchived", false] }
              ]
            }
          }
        }],
        as: "post"
      }
    },
    {
      $lookup: {
        from: "savedposts",
        let: { id: "$_id" },
        pipeline: [{
          $match: {
            $expr: {
              $eq: ["$userID", "$$id"]
            }
          }
        }],
        as: "saved"
      }
    },
    {
      $project: {
        "_id": 0,
        "fullName": 1,
        "email": 1,
        "profile": 1,
        "postCount": { $size: "$post" },
        "savedCount": { $size: "$saved" },
        "createdAt": 1
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit }
  ])

  //find total count of users
  const totalUsers = await UserModel.countDocuments(
    find
  );

  //generates pages by dividing total users displayed in one page
  const pageCount = Math.ceil(totalUsers / limit);
  const page = [];
  for (let i = 1; i <= pageCount; i++) {
    page.push(i);
  }

  //if this route is called using ajax request than load data through partials
  if (req.xhr) {
    res.render("partials/report", {
      title: 'Report Page',
      users: user,
      layout: 'blank',
      page: page

    });
  }

  //otherwise load data through rendering report page
  else {
    res.render('report', {
      title: 'Report Page',
      users: user,
      page: page
    });
  }
});
module.exports = router;