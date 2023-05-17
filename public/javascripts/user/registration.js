$(document).ready(function () {
    $.validator.addMethod("strongePassword", function (value) {
        return /^[A-Za-z0-9\d=!\-@._*]*$/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[A-Z]/.test(value);
    });
    $("#RegistrationForm").validate({
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
                remote: "check-email"
            },
            "gender": {
                required: true
            },
            "pswd": {
                required: true,
                minlength: 8,
                strongePassword: true
            },
            "cpswd": {
                required: true,
                equalTo: "#pswd"
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
            "cpswd": {
                required: 'Confirm Your Password',
                equalTo: 'Password Not Matched'
            },
        },
        errorPlacement: function (error, element) {
            if (element.attr('name') == "gender") {
                error.insertAfter("#Gendererror");
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function () {
            let data = {
                fname: $("#rfname").val().trim(),
                lname: $("#rlname").val().trim(),
                email: $("#email").val().trim(),
                gender: $('input[name="gender"]:checked').val(),
                password: $("#pswd").val(),
            }
            $.ajax({
                type: "post",
                url: "/registration",
                data: data,
                success: function (res) {
                    if (res.type == 'error') {
                        window.location.href = '/login';
                    }
                    else {
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
