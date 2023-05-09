$(document).ready(function () {

    let currentPostId = null;

    $(".closeEditPostModal").on('click', function () {
        $("#editPostModal").modal('toggle');
    });
 
    $(".edit-btnn").unbind('click').on("click", function () {
        currentPostId = $(this).data("postid");
        $.ajax({
            type: "post",
            url: '/posts/edit',
            data: {
                postId: $(this).data("postid"),
            },
            success: function (res) {
                if (res.type == 'success') {
                    $(".title_old").val(res.data.title);
                    $(".description_old").val(res.data.description);
                    $("#editPostModal").modal('show');
                }
                else {
                    alert(res.message);
                }
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });

    $.validator.addMethod('filesize', function (value, element, param) {
        return this.optional(element) || (element.files[0].size <= param * 1000000)
    }, 'File size must be less than 2 MB');

    $("#editPostForm").validate({
        keypress: true,
        rules: {
            "title": {
                required: true,
                maxlength: 30
            },
            "description": {
                maxlength: 300
            },
            "image_new": {
                extension: "jpg|jpeg|gif",
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
            "image_new": {
                extension: "Please Upload .jpg,.jpeg or .gif file",
                filesize: "File must be less than 2 MB"
            }
        },
        errorPlacement: function (error, element) {
            if (element.attr('name') == "image_new") {
                error.insertAfter("#imageError");
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function () {
            var formData = new FormData();
            formData.append('postId', currentPostId);
            formData.append('title', $(".title_old").val());
            formData.append('description', $(".description_old").val());
            formData.append('files', $("#image_new")[0].files[0]);
            $.ajax({
                type: "put",
                url: '/posts',
                data: formData,
                contentType: false,
                processData: false,
                success: function (res) {
                    if (res.type == 'success') {
                        $("#editPostModal").modal('toggle');
                        // toastr.success("Post Edited");
                        // $("#listPost").load('/' + ' #listPost > *', function (data) {
                        // });
                        alert("Post edited successfully");
                        window.location.reload();
                    }
                    else {
                        alert(res.message);
                    }
                },
                error: function (err) {
                    console.log(err.toString());
                }
            })
        }
    });
});