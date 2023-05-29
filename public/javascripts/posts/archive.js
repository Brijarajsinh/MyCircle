$(document).ready(function () {
    $(document).unbind().on('click', '#archive-btn', function () {
        //On Click of archive post an ajax delete request is called to set flag isArchived = true
        $.ajax({
            type: "delete",
            url: `/posts/${$(this).data("post-id")}/archive`,
            success: function (res) {
                let url = '?'
                const filter = $(".filter").val();
                if (filter == "arch") {
                    url += `arch=1&`
                }
                else {
                    url += `filter=${filter}&`
                }
                if (res.type == 'success') {
                    toastr.success(res.message);
                    $(`#list-post`).load(`/${url}` + ` #list-post > *`, function (data) {
                    });
                }
                else {
                    toastr.success(res.message);
                    $(`#list-post`).load(`/${url}` + ` #list-post > *`, function (data) {
                    });
                }
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });
})
