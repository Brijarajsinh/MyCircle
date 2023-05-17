var express = require('express');
var router = express.Router();
const UserModel = require('../schema/userSchema');

router.get('/', async function (req, res, next) {
  let find = {}
  let page_skip = (Number(req.query.page)) ? Number(req.query.page) : 1;
  let limit = 3;
  let skip = (page_skip - 1) * limit

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

  let user = await UserModel.aggregate([
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
  let totalUsers = await UserModel.countDocuments(
    find
  );
  let pageCount = Math.ceil(totalUsers / limit);
  let page = [];
  for (let i = 1; i <= pageCount; i++) {
    page.push(i);
  }

  if (req.xhr) {
    res.render("partials/report", {
      title: 'Report Page',
      users: user,
      layout: 'blank',
      page: page

    });
  }
  else {
    res.render('report', {
      title: 'Report Page',
      users: user,
      page: page
    });
  }
});
module.exports = router;