$(document).ready(function () {
    $(".reported").hide();
    function getURL() {
        let url = '/report?';
        let search = $(".search_user").val();
        if (search) {
            url += `search=${search}&`
        }
        return url;
    }
    $(".search_user").unbind().on('input', function () {
        $.ajax({
            type: "get",
            url:getURL(),
            success: function (res) {
                $("#report").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });
    $(document).unbind('click').on('click','.userWise', function () {
        let page = $(this).data("page");
        let url = getURL();
        url += `page=${page}`;
        $.ajax({
            type: "get",
            url: url,
            success: function (res) {
                // console.log(res);
                $("#report").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });
});