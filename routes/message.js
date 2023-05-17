var express = require('express');
var router = express.Router();


router.get('/', function (req, res, next) {
    console.log("Message will be displayed soonnn");
    if (req.xhr) {
        res.render("partials/report", {
            title: 'Messages',
            users: user,
            layout: 'blank',
            page: page
        });
    }
    else {
        res.render('report', {
            title: 'Messages',
            users: user,
            page: page
        });
    }
})

module.exports = router;
