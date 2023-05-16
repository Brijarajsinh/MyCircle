var express = require('express');
var router = express.Router();
const UserModel = require('../schema/userSchema');
router.get('/', async function (req, res, next) {
    await UserModel.updateOne(
        { "email" : req.query.email },
        { $set: { "isVerified" : true } }
    );
    res.status(205).redirect('/login')
})
module.exports = router;
