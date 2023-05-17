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

    $(".like").unbind('click').on('click', function () {
        var like = $(this).data("likes")
        $.ajax({
            type: "post",
            url: '/posts/like',
            data: {
                postId: $(this).data("postid"),
                createdBy: $(this).data("created")
            },  
            success: function (res) {
                if (res.type == "success") {
                    like++;
                    toastr.success(res.message);
                    $(`#c${res.id}`).text(`${like} Likes`);
                    $(`#l${res.id}`).attr('src',"/images/liked.jpeg");
                    $(`#l${res.id}`).data('likes',like);
                }
                else {
                    like--;
                    toastr.error(res.message);
                    $(`#c${res.id}`).text(`${like} Likes`);
                    $(`#l${res.id}`).attr('src',"/images/like.jpeg");
                    $(`#l${res.id}`).data('likes',like);
                }
            },
            error: function (err) {
                console.log(err.toString());
                alert(err.toString());
            }
        });
    })
    
});