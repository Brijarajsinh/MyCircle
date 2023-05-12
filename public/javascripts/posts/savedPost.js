$(document).ready(function () {
    $(document).on("click", ".save-btn", function () {
        $.ajax({
            type: "post",
            url: '/posts/save',
            data: {
                postId: $(this).data("postid")
            },
            success: function (res) {
                console.log("FILTER WILL BE APPLIED");
                var filter = $(".filter").val();
                if (res.type == 'success') {
                    toastr.success(res.message);
                    $(`#${res.id}`).load(`/?filter=${filter}` + ` #${res.id} > *`, function (data) {
                    });
                }
                else {
                    toastr.warning(res.message);
                    $(`#listPost`).load(`/?filter=${filter}` + ` #listPost > *`, function (data) {
                    });
                }
            },
            error: function (err) {
                alert(err.toString());
                console.log(err.toString());
            }
        })
    });
});