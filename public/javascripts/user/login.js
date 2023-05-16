$(document).ready(function(){
        $("#LoginForm").validate({
            keypress : true,
            rules :{
                "email" : {
                    email:true,
                    required : true
                },
                "pswd":{
                    required:true
                }
            },
            messages :{
                "email" : {
                    required : 'Please Enter E-mail',
                    email:'Enter Valid E-mail'
                },
                "pswd":{
                    required:'Please Enter Password'
                }
            },
            errorPlacement: function (error, element) {
                if (element.attr('name') == "pswd") {
                    error.insertAfter("#PasswordError");
                } else {
                    error.insertAfter(element);
                }
            },
            submitHandler: function (form) {
                form.submit();
            }
            });
});