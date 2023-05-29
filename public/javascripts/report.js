$(document).ready(function () {

    //when user access the '/report' page hide searching and sorting option of list-post 
    $(".reported").hide();


    //getURL function generates a query string and return it
    function getURL() {
        let url = '/report?';
        const search = $(".search-user").val();

        //if logged-in user search other user by first name, last name and full name than that search value is passed in query parameter 
        if (search) {
            url += `search=${search}&`
        }
        return url;
    }

    //if current user searches than ajax request is called with search parameter as url
    $(".search-user").unbind().on('input', function () {
        $.ajax({
            type: "get",
            url:getURL(),
            success: function (res) {
                //if response type of ajax request is success than shows only fetched user-details
                $("#report").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });

    //when user moves to another page than ajax called 
    //with that selected page value as page parameter in ajax request query string
    $(document).unbind('click').on('click','.user-wise', function () {
        const page = $(this).data("page");
        let url = getURL();
        url += `page=${page}`;
        $.ajax({
            type: "get",
            url: url,
            success: function (res) {
                //displays fetched records to the user
                $("#report").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });
});