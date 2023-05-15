$('.likeNotification').on('click', function () {
    $.ajax({
        type: "put",
        url: '/notification',
        data: {
            "_id": $(this).attr('id')
        },
        success: function (res) {
            if (res.type == 'success') {
                $(".counter").text(res.count);
                $(`#${res.deleted}`).remove();
            }
        },
        error: function (err) {
            alert(res.message);
        }
    })
})