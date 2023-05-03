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
    $(".pagewise").unbind().on("click", function () {
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

    $(".search").unbind().on('input', function () {
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
})