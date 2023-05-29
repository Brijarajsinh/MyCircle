$(document).ready(function () {

    //login-form is validate using jquery validator method
    $("#login-form").validate({
        keypress: true,
        rules: {
            "email": {
                email: true,
                required: true
            },
            "pswd": {
                required: true
            }
        },
        messages: {
            "email": {
                required: 'Please Enter E-mail',
                email: 'Enter Valid E-mail'
            },
            "pswd": {
                required: 'Please Enter Password'
            }
        },

        //if error generates by jquery validator
        errorPlacement: function (error, element) {

            //on password element than place that error after password field
            if (element.attr('name') == "pswd") {
                error.insertAfter("#password-error");
            }
            //else place all other error just after from which error generated
            else {
                error.insertAfter(element);
            }
        },

        //on submit of login-form submit the form to the action with method post
        submitHandler: function (form) {
            form.submit();
        }
    });
});