$(document).ready(function () {

    //add method to validate password field is strong enough or not
    $.validator.addMethod("strongePassword", function (value) {
        return /^[A-Za-z0-9\d=!\-@._*]*$/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[A-Z]/.test(value);
    });

    //using jquery validator validate the registration form details which are enterd by user
    $("#registration-form").validate({
        keypress: true,
        rules: {
            "fname": {
                required: true
            },
            "lname": {
                required: true
            },
            "email": {
                required: true,
                email: true,
                remote: "/check-email"
            },
            "gender": {
                required: true
            },
            "pswd": {
                required: true,
                minlength: 8,
                strongePassword: true
            },
            "confirm-pswd": {
                required: true,
                equalTo: "#register-password"
            },
        },
        messages: {
            "fname": {
                required: 'First Name is Required'
            },
            "lname": {
                required: 'Last Name is Required'
            },
            "email": {
                required: 'E-mail is required',
                remote: 'E-mail is already Registered',
                email: 'Please Enter Valid E-mail'

            },
            "gender": {
                required: 'Select Gender'
            },
            "pswd": {
                required: 'Password is Required',
                strongePassword: "(Use a combination of upper case letters, lower case letters, numbers, and special characters for example: !, @, &, %, +)",
                minlength: 'Password Must contain 8 characters'
            },
            "confirm-pswd": {
                required: 'Confirm Your Password',
                equalTo: 'Password Not Matched'
            },
        },
        //if error generated from jquery validator than place that error at specific location
        errorPlacement: function (error, element) {

            //if error generated from gender element than place that error just after gender-error element
            if (element.attr('name') == "gender") {
                error.insertAfter("#gender-error");
            }
            //else place that error just after form which that error is generated
            else {
                error.insertAfter(element);
            }
        },
        //on submit of registration-form validate user entered details using jquery validator
        submitHandler: function () {
            //append the user entered details in data object
            const data = {
                fname: $("#register-fname").val().trim(),
                lname: $("#register-lname").val().trim(),
                email: $("#register-email").val().trim(),
                gender: $('input[name="gender"]:checked').val(),
                password: $("#register-password").val(),
            }
            //an ajax request with data of user's details to store in users collection
            $.ajax({
                type: "post",
                url: "/registration",
                data: data,
                success: function (res) {
                    if (res.type == 'error') {
                        //on error response of ajax request user redirect to login page
                        window.location.href = '/login';
                    }
                    else {
                        //on success response of ajax request user redirect to timeline page
                        window.location.href = "/"
                    }
                },
                error: function (err) {
                    console.log(err.toString());
                }
            })
        }
    });
});
