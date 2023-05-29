const md5 = require('md5');

module.exports = {
    userProfileEdit: function (editProfile) {
        const updatedDetails = {
            "fname": editProfile.fname,
            "lname": editProfile.lname,
            "gender": editProfile.gender
        }
        return updatedDetails;
    },
    userRegistration: function (userDetails) {
        const user = {
            "fname": userDetails.fname,
            "lname": userDetails.lname,
            "email": userDetails.email,
            "gender": userDetails.gender,
            "password": md5(userDetails.password),
            "profile": "default_user.jpg"

        }
        return user;
    }
}