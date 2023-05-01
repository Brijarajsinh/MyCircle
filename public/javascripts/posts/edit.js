$(document).ready(function () {
    let currentPostId = null;
    $(".closeEditPostModal").on('click',function(){
        $("#editPostModal").modal('toggle');
    });
    $(".edit-btnn").bind('click').on("click", function () {
    // $(document).off('click','.edit-btnn').on('click','.edit-btnn',function(){
        currentPostId = $(this).data("postid");
        $.ajax({
            type: "post",
            url: '/posts/edit',
            data: {
                postId: $(this).data("postid"),
            },
            success: function (res) {
                if (res.type == 'success') {
                    // alert("edit will be done");
                    // console.log(res.data);
                    $(".title_old").val(res.data.title);
                    $(".description_old").val(res.data.description);
                    $("#editPostModal").modal('show');
                    // $("#editPostModal").toggleClass('show');
                }
                else {
                    // alert("edit will be done");
                    alert(res.message);
                }
            },
            error: function (err) {
                // alert("Please Upload .gif,.jpeg or .png file");
                console.log(err.toString());
            }
        })
    })
    $("#editPostForm").validate({
        keypress: true,
        rules: {
            "title": {
                required: true
            },
            "files": {
                extension: "jpg|jpeg|gif"
            }
        },
        messages: {
            "title": {
                required: 'Title is Required'
            },
            "files": {
                extension: "Please Upload .jpg,.jpeg or .gif file"
            }
        },
        submitHandler: function () {
            var formData = new FormData();
            formData.append('postId',currentPostId);
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
                        $('#editPostModal').modal().hide();
                        alert("Post edited successfully");
                        window.location.reload();
                    }
                    else {
                        alert(res.message);
                    }
                },
                error: function (err) {
                    // alert("Please Upload .jpg,.jpeg or .png file");
                    console.log(err.toString());
                }
            })
        }
    });
});