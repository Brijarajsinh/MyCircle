$(document).ready(function () {
    $(document).unbind().on('click', '#archive-btn', function () {
        $.ajax({
            type: "delete",
            url: "/posts",
            data: {
                postId: $(this).data("postid")
            },
            success: function (res) {
                if (res.type == 'success') {
                    toastr.warning(res.message);
                    $("#listPost").load('/' + ' #listPost > *', function (data) {
                    });
                }
                else {
                    toastr.success(res.message);
                    $("#listPost").load('/' + ' #listPost > *', function (data) {
                    });
                }
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });
})
