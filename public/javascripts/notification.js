//if user clicks on notification than ajax call to
//update notification status from isRead false to isRead true
$('.like-notification').on('click', function () {

    $.ajax({
        type: "put",
        url: `/notification/${$(this).attr('id')}/read`,
        success: function (res) {
            if (res.type == 'success') {
                //if ajax response type is success
                //than descrease notification counter by 1
                //and remove that notification from list
                $(".counter").text(res.count);
                $(`#${res.deleted}`).remove();
            }
        },
        error: function (err) {
            alert(err.message);
        }
    })
})