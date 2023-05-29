$(document).ready(function () {

    /**
     * generated a url with quey parameter 
     * which are passed to with ajax request
     * @returns URL that is passed in url parameter of ajax request
     */
    function getUrl() {
        let url = '/?';
        const filter = $(".filter").val();
        const sort = $(".sort").val();
        const sortOrder = $(".sort-order").val();
        const search = $(".search").val();
        if (filter == "arch") {
            //if archived filter is selected by user than add arch=1 in url query string
            url += `arch=1&`
        }
        else {
            //otherwise add filter parameter in query string which are selected by user 
                //that may be "saved, mine, others"
                //By Default that filter is equal to all posts
            url += `filter=${filter}&`
        }
        if (sort) {
            //if  sorting option is selected by user (title) than pass sort = title in query string
            //By default sort = date
            url += `sort=${sort}&`
        }
        if (search) {

            //if user search post by title and description than add search in query string
            url += `search=${search}&`
        }
        if (sortOrder) {
            //if user wants to select the sorting order than pass the sort variable in query string 
            //by default selected value is descending order of posts
            url += `sortOrder=${sortOrder}&`
        }
        return url;
    }

    $(".page-wise").unbind('click').on('click', function () {
        //on click of page pass the page value in query string 
        //and with ajax request load the post of that page
        //by default it is 1
        const page = $(this).data("page");
        let url = getUrl();
        url += `page=${page}`;
        $.ajax({
            type: "get",
            url: url,
            success: function (res) {
                //on success response of ajax request set the posts of that page
                $("#list-post").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        });
    });
    $(".search").unbind('click').on('input', function () {
        //On input of search, ajax request is called with search value
        $.ajax({
            type: "get",
            url: getUrl(),
            success: function (res) {
                //on success response of ajax request set the posts which are searched by user
                $("#list-post").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });
    $(".filter").unbind('change').on('change', function () {

        //on selection of filter ajax request is called with selected filter value
        $.ajax({
            type: "get",
            url: getUrl(),
            success: function (res) {
                //on success response of ajax request set the filtered posts which are filtered by user
                $("#list-post").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });
    $(".sort").unbind('change').on('change', function () {
        //on selection of sorting value ajax request called with sort parameter
        $.ajax({
            type: "get",
            url: getUrl(),
            success: function (res) {
                //and success of the ajax request set the sorted posts according to user sorting criteria
                $("#list-post").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });
    $(".sort-order").unbind('change').on('change', function () {
        //on selection of sort order value ajax request called with sort-order parameter

        $.ajax({
            type: "get",
            url: getUrl(),
            success: function (res) {
                //On success of ajax request set the post in user selected order
                //by default that is descending order
                $("#list-post").html(res);
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });

    $(".like").unbind('click').on('click', function () {
        //on click of like button an ajax request is called that stores the liked post by current user in likedPost collection
        var like = $(this).data("likes")
        $.ajax({
            type: "post",
            url: `/posts/${$(this).data("post-id")}/${$(this).data("created")}/like`,
            success: function (res) {
                if (res.type == "success") {
                    //ajax response type is success that means liked
                    //set the counter + 1 and toggle the dislike logo to like logo
                    like++;
                    toastr.success(res.message);
                    $(`#c-${res.id}`).text(`${like} Likes`);
                    $(`#l-${res.id}`).attr('src', "/images/liked.jpeg");
                    $(`#l-${res.id}`).data('likes', like);
                }
                else{
                    //ajax response type is error that means disliked
                    //set the counter - 1 and toggle the like logo to dislike logo
                    like--;
                    toastr.success(res.message);
                    $(`#c-${res.id}`).text(`${like} Likes`);
                    $(`#l-${res.id}`).attr('src', "/images/like.jpeg");
                    $(`#l-${res.id}`).data('likes', like);
                }
            },
            error: function (err) {
                console.log(err.toString());
                alert(err.toString());
            }
        });
    })

});