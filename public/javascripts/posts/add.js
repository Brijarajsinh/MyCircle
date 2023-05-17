$(document).ready(function () {

    $(".addPostModal").on('click', function () {
        $("#addPost").modal('show');
    });

    $(".closeAddPost").on('click', function () {
        $("#addPost").modal('toggle');
    });

    $.validator.addMethod('filesize', function (value, element, param) {
        return this.optional(element) || (element.files[0].size <= param * 1000000)
    }, 'File size must be less than {2} MB');

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
                extension: "gif|jpeg|png|jpg",
                filesize: 2
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
                extension: "Please select .gif , .png or .jpeg/.jpg file",
                filesize: "File must be less than 2 MB"
            }
        },
        errorPlacement: function (error, element) {
            if (element.attr('name') == "image") {
                error.insertAfter("#postError");
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function () {
            var formData = new FormData();
            formData.append('title', $("form#addPostForm [name=title]").val().trim());
            formData.append('description', $("#description").val().trim());
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
                        alert("Post Added Successfully");
                        window.location.reload();
                    }
                    else {
                        $('#addPost').modal().hide();
                        alert(res.message);
                        window.location.href = '/';
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