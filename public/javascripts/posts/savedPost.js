$(document).ready(function () {
    $(document).on("click", ".save-btn", function () {
        //On click of save post an ajax request is called which saves the selected post by current logged in user 
        //and store details in savedPost collection
        $.ajax({
            type: "post",
            url: `/posts/${$(this).data("post-id")}/save`,
            success: function (res) {
                let url = '?'
                const filter = $(".filter").val();
                url += `filter=${filter}&`
                //if response type is success than user successfully saved post 
                //and set flag from save to unsave by reloading the post contents
                if (res.type == 'success') {
                    toastr.success(res.message);
                    // $(`.s${res.id}`).text("Unsave");
                    $(`#p-${res.id}`).load(`/${url}` + ` #p-${res.id} > *`, function (data) {
                    });
                }
                else {
                    //if response type is error than user successfully unsaved post 
                    //and set flag from unsave to save by reloading the post contents
                    toastr.success(res.message);
                    // $(`.s${res.id}`).text("Save");

                    //if user unsave post when savedPost filter is applied than load the list of posts
                    if (filter == "saved") {
                        $(`#list-post`).load(`/${url}` + ` #list-post > *`, function (data) {
                        });
                    }
                    //else load only that post
                    else {
                        $(`#p-${res.id}`).load(`/${url}` + ` #p-${res.id} > *`, function (data) {
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