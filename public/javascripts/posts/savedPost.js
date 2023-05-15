$(document).ready(function () {
    $(document).on("click", ".save-btn", function () {
        
        $.ajax({
            type: "post",
            url: '/posts/save',
            data: {
                postId: $(this).data("postid")
            },
            success: function (res) {
                let url = '?'
                var filter = $(".filter").val();
                if (filter == "arch") {
                    url += `arch=1&`
                }
                else {
                    url += `filter=${filter}&`
                }
                if (res.type == 'success') {
                    toastr.success(res.message);
                    $(`#listPost`).load(`/${url}` + ` #listPost > *`, function (data) {
                    });
                }
                else {
                    toastr.warning(res.message);
                    $(`#listPost`).load(`/${url}` + ` #listPost > *`, function (data) {
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