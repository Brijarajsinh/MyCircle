$(document).ready(function () {
    var value = $("#pswd").val();
    $.validator.addMethod("strongePassword", function(value) {
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
                minlength:'Password Must contain 8 characters'
            },
            "cpswd": {
                required: 'Confirm Your Password',
                equalTo: 'Password Not Matched'
            },
        },
        submitHandler: function (form) {
            form.submit();
        }
    });
});
