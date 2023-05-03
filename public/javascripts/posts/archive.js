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
                    alert(res.message);
                    window.location.reload();
                }
                else {
                    alert(res.message)
                }
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });
})
