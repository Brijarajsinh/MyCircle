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
                    // $(`.s${res.id}`).text("Unsave");
                    $(`#p${res.id}`).load(`/${url}` + ` #p${res.id} > *`, function (data) {
                    });
                }
                else if(res.status == 401){
                    alert(res.message);
                    window.location.reload();
                }
                else {
                    toastr.success(res.message);
                    // $(`.s${res.id}`).text("Save");
                    if (filter == "saved") {
                        $(`#listPost`).load(`/${url}` + ` #listPost > *`, function (data) {
                        });
                    }
                    else{
                        $(`#p${res.id}`).load(`/${url}` + ` #p${res.id} > *`, function (data) {
                        });
                    }
                }
            },
            error: function (err) {
                alert(err.toString());
                console.log(err.toString());
            }
        })
    });
});