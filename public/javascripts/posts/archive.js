$(document).ready(function () {
    $(document).unbind().on('click', '#archive-btn', function () {
        $.ajax({
            type: "delete",
            url: "/posts",
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
                console.log(url);
                if (res.type == 'success') {
                    toastr.success(res.message);
                    // $(`#p${res.id}`).remove();
                    $(`#listPost`).load(`/${url}` + ` #listPost > *`, function (data) {
                    });
                }

            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });
})
