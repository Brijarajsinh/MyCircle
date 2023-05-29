$(document).ready(function () {
    let currentPostId = null;
    //On click of close button inside the edit post modal closes the edit post modal
    $(".close-edit-post-modal").on('click', function () {
        $("#edit-post-modal").modal('toggle');
    });


    $(".edit-btnn").unbind().on("click", function () {
        /**
            * onClick of edit post button an ajax request called to fetched the current clicked post details 
            * and set that details in edit post modal
        */
        currentPostId = $(this).data("post-id");
        $.ajax({
            type: "get",
            url: `/posts/${currentPostId}/edit`,

            success: function (res) {
                if (res.type == 'success') {
                    $(".title-old").val(res.data.title);
                    $(".description-old").val(res.data.description);
                    $(".submit").attr('post', res.id);
                    $("#edit-post-modal").modal('show');
                    currentPostId = res.id;
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
    //Add method to validate uploaded post image size is less than 2 mb
    $.validator.addMethod('filesize', function (value, element, param) {
        return this.optional(element) || (element.files[0].size <= param * 1000000)
    }, 'File size must be less than 2 MB');

    //using jquery validations validate user entered details for editing post details
    $("#edit-post-form").validate({
        keypress: true,
        rules: {
            "title": {
                required: true,
                maxlength: 30
            },
            "description": {
                maxlength: 300
            },
            "image-new": {
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
            "image-new": {
                extension: "Please Upload .jpg,.jpeg or .gif file",
                filesize: "File must be less than 2 MB"
            }
        },
        errorPlacement: function (error, element) {
            if (element.attr('name') == "image-new") {
                error.insertAfter("#image-error");
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function () {
            var formData = new FormData();
            formData.append('title', $(".title-old").val().trim());
            formData.append('description', $(".description-old").val().trim());
            formData.append('files', $("#image-new")[0].files[0]);
            $.ajax({
                /**
                 * after validating user entered details,
                 * ajax request of put type is called to update user entered details in db and 
                 * success response of ajax request set the updated details of post
                 */
                type: "put",
                url: `/posts/${$(".submit").attr("post")}/edit`,
                data: formData,
                contentType: false,
                processData: false,
                success: function (res) {
                    if (res.type == 'success') {
                        let url = '/?'
                        const filter = $(".filter").val();
                        url += `filter=${filter}&`
                        $("#edit-post-modal").modal('toggle');
                        toastr.success("Post Edited");
                        $(`#t-${res.id}`).text($(".title-old").val());
                        $(`#d-${res.id}`).text($(".description-old").val());
                        if (res.image) {
                            $(`#i-${res.id}`).html(
                                `<img src=/images/posts/${res.image} style="height:300px; width:250px" alt="NOT"/>`
                            );
                        }
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

