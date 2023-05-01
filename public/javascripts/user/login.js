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
            submitHandler: function (form) {
                form.submit();
            }
            });
});