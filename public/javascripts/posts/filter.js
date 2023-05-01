$(document).ready(function () {
    function getURL() {
        let url = '/?';
        let filter = $(".filter").val();
        let sort = $(".sort").val();
        let search = $(".search").val();
        if (filter) {
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
    $(".pagewise").unbind('click').on('click',function () {
        let page = $(this).data("page");
        let url = getURL();
        url += `page=${page}`;
        alert(url);
        $.ajax({
            type: "get",
            url: url,
            success: function (res) {
                // console.log(res);
                $("#listPost").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });
    $(".search").unbind().on('input', function () {
        $.ajax({
            type: "get",
            url: getURL(),
            success: function (res) {
                console.log(res);
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
                console.log($("#listPost").length);
                // console.log(res);
                $("#listPost").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });
    $(".sort").unbind('change').on('change', function () {
        // alert(getURL());

        $.ajax({
            type: "get",
            url: getURL(),
            success: function (res) {
                console.log(res);
                $("#listPost").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });
    $("#archivedPost").unbind('click').on('click', function () {
        let arch = $(".arch").data("userid");
        let url = '?';
        if (arch) {
            url += `arch=${arch}&`
        }
        $.ajax({
            type: "get",
            url: url,
            success: function (res) {
                console.log(res);
                $("#listPost").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });
})
