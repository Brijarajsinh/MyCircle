$(document).ready(function () {

    $(".add-post-modal").on('click', function () {
        //On Click of Add Post link open a modal
        $("#add-post").modal('show');
    });

    $(".close-add-post").on('click', function () {
        //On Click of close button closes a modal which are opened to post
        $("#add-post").modal('toggle');
    });

    $.validator.addMethod('filesize', function (value, element, param) {
        //add filesize rule to JqueryValidator which validates user to upload file greater than 2 mb size
        return this.optional(element) || (element.files[0].size <= param * 1000000)
    }, 'File size must be less than {2} MB');

    $("#add-post-form").validate({
        //using jquery validations, validate user entered data to add a post
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
        //errorPlacement function to place error after element, if error generated
        errorPlacement: function (error, element) {
            if (element.attr('name') == "image") {
                error.insertAfter("#post-error");
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function () {
            var formData = new FormData();
            //append formData with user entered data to add a post
            formData.append('title', $("#title").val().trim());
            formData.append('description', $("#description").val().trim());
            formData.append('files', $("#image")[0].files[0]);
            $.ajax({
                //Ajax request of post method calls `/posts` route to add a post in db
                type: "post",
                url: '/posts',
                data: formData,
                contentType: false,
                processData: false,
                success: function (res) {
                    //success response of ajax call 
                    if (res.type == 'success') {
                        //if res type is success than close addPost modal and reload the page to show updated post
                        $('#add-post').modal().hide();
                        alert("Post Added Successfully");
                        window.location.reload();
                    }
                    else {
                        //else alerts user that he/she is not verified yet
                        $("#add-post").modal('toggle');
                        toastr.error("Please Verify First");
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