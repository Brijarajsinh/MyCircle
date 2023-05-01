$(document).ready(function () {
    $(document).on("click", ".save-btn", function () {
        $.ajax({
            type: "post",
            url: '/posts/save',
            data: {
                postId: $(this).data("postid")
            },
            success: function (res) {
                if (res.type == 'success') {
                    alert(res.message);
                    window.location.reload();
                }
                else {
                    alert("Please Login TO SAVE this post...");
                    window.location.replace('/login');
                }
            },
            error: function (err) {
                alert(err.toString());
                console.log(err.toString());
            }
        })
    });
});