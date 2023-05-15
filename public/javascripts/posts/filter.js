$(document).ready(function () {

    function getURL() {
        let url = '/?';
        let filter = $(".filter").val();
        let sort = $(".sort").val();
        let search = $(".search").val();
        if (filter == "arch") {
            url += `arch=1&`
        }
        else {
            url += `filter=${filter}&`
        }
        if (sort) {
            url += `sort=${sort}&`
        }
        if (search) {
            url += `search=${search}&`
        }
        return url;
    }

    $(".pagewise").unbind('click').on('click', function () {

        // $(document).on("click", ".pagewise", function () {
        // $(".pagewise").unbind().on("click", function () {
        let page = $(this).data("page");
        let url = getURL();
        url += `page=${page}`;
        $.ajax({
            type: "get",
            url: url,
            success: function (res) {
                $("#listPost").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        });
    });
    $(".search").unbind('click').on('input', function () {
        $.ajax({
            type: "get",
            url: getURL(),
            success: function (res) {
                $("#listPost").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });
    $(".filter").unbind('change').on('change', function () {
        // alert(getURL());
        $.ajax({
            type: "get",
            url: getURL(),
            success: function (res) {
                $("#listPost").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });
    $(".sort").unbind('change').on('change', function () {
        $.ajax({
            type: "get",
            url: getURL(),
            success: function (res) {
                $("#listPost").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });
    // $(".order").unbind('change').on('change', function () {
    //     $.ajax({
    //         type: "get",
    //         url: getURL(),
    //         success: function (res) {
    //             $("#listPost").html(res);
    //         },
    //         error: function (err) {
    //             console.log(err.toString());
    //         }
    //     })
    // });

    $('.like').unbind('click').on('click', function () {
        let _this = this
        $.ajax({
            type: "post",
            url: '/posts/like',
            data: {
                postId: $(this).data("postid"),
                createdBy: $(this).data("created")
            },
            success: function (res) {
                let url = '/?'
                var filter = $(".filter").val();
                if (filter == "arch") {
                    url += `arch=1&`
                }
                else {
                    url += `filter=${filter}&`
                }
                // alert(url);
                if (res.type == "success") {
                    toastr.success(res.message);
                    console.log("54");
                    // $(`#p${res.id}`).load(`${url}` + ` .likeDetails < #p${res.id} `, function (data) {
                    // });
                }
                else {
                    toastr.error(res.message);
                    // $(`#p${res.id}`).load(`${url}` + ` .likeDetails < #p${res.id} `, function (data) {
                    // });
                }
            },
            error: function (err) {
                console.log(err.toString());
                alert(err.toString());
            }
        });
    })


    //$(".like").off('click').on('click', function () {
    // $(document).unbind("click", ".like").on("click", ".like", function () {
    //     $.ajax({
    //         type: "post",
    //         url: '/posts/like',
    //         data: {
    //             postId: $(this).data("postid"),
    //             createdBy: $(this).data("created")
    //         },
    //         success: function (res) {
    //             if (res.type == "success") {
    //                 toastr.success(res.message);
    //                 $(`#p${res.id}`).load(`${getURL()}` + ` #p${res.id} > *`, function (data) {
    //                 });
    //             }
    //             else {
    //                 toastr.error(res.message);
    //                 $(`#p${res.id}`).load(`${getURL()}` + ` #p${res.id} > *`, function (data) {
    //                 });
    //             }
    //         },
    //         error: function (err) {
    //             console.log(err.toString());
    //             alert(err.toString());
    //         }
    //     });
    // })
});