$(document).ready(function () {

$(".addPostModal").on('click',function(){
    $("#addPost").modal('show');
});

$(".closeAddPost").on('click',function(){
    $("#addPost").modal('toggle');
    
})
    $("#addPostForm").validate({
        keypress: true,
        rules: {
            "title": {
                required: true,
                maxlength: 30
            },
            "description": {
                maxlength: 300
            },
            "image": {
                extension: "gif|jpeg|png|jpg"
            }
        },
        messages: {
            "title": {
                required: 'Title is Required',
                maxlength: "Title length must less than 30 characters"
            },
            "description": {
                maxlength: "Description length must less than 300 characters"
            },
            "image": {
                extension: "Please select .gif , .png or .jpeg/.jpg file"
            }
        },
        submitHandler: function () {
            // alert("POST WILL BE ADDED");
            var formData = new FormData();
            // const formData = new FormData($(form)[0]);
            formData.append('title', $("form#addPostForm [name=title]").val());
            formData.append('description', $("#description").val());
            formData.append('files', $("#image")[0].files[0]);
            $.ajax({
                type: "post",
                url: '/posts',
                data: formData,
                contentType: false,
                processData: false,
                success: function (res) {
                    if (res.type == 'success') {
                        $('#addPost').modal().hide();
                        alert("Post added successfully");
                        window.location.reload();
                    }
                    else {
                        alert(res.message);
                    }
                },
                error: function (err) {
                    // alert("Please Upload .gif,.jpeg or .png file");
                    console.log(err.toString());
                }
            })
        }
    })
})