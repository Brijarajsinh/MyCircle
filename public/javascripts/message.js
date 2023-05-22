
$(document).ready(function () {
    $(".reported").hide();

    $(".chatting").on('click', function () {

        $(".sender").html('');
        $(".chatbox").attr("hidden", false);
        $(".chatbox").attr("id", $(this).attr("id"));
        $(".message").attr("data-receiver", $(this).attr("id"));
        let countMessage = $(`#message-count`).text();
        if (countMessage > 0) {
            countMessage--;
            $(`#message-count`).text(countMessage);
        }
        let id = $(this).attr("id");
        $(`#c${id}`).text(0);
        $(`#c${id}`).data('count', 0);
        getMessageContents(`/messages/get/?receiver=${$(this).attr("id")}&`);

    });
    $(".content").keyup(function (event) {
        if (event.keyCode === 13) {
            sendMessage();
        }
    });
    $(".send").on("click", function () {
        sendMessage();
    });
    function sendMessage() {
        let content = $(".content").val().trim();
        if (content) {
            $(".sender").append(`
                        <p>${content}</p>
                   `);
            let data = { "content": content };
            data.receiver = $(".message").attr("data-receiver");
            $.ajax({
                type: "post",
                url: "/messages",
                data: data,
                success: function (res) {
                    if (res.type == 'success') {
                        toastr.success(res.message);
                    }
                    else {
                        toastr.error(res.message);
                    }
                },
                error: function (err) {
                    console.log(err.toString());
                }
            })
            $(".content").val("");
        }
        else {
            toastr.info("Please Type message...");
        }
    };

    function getMessageContents(url) {
        $.ajax({
            type: "get",
            url: url,
            async: true,
            success: function (res) {
                if (res.type == 'success') {
                    $(".receiver").html('');
                    // $(".Message_content").prepand(`
                    //     <div class="message_history">
                    //     </div>
                    // `);
                    toastr.success("ChatBox Opened");
                    for (let val of res.data) {
                        if (val.senderID == res.currentUSER) {
                            //console.log("SENT MESSAGES " + val.content);
                            $(".sender").prepend(`<p>${val.content}</p>`);
                            //$(".message_history").append(`<p class="text-right">${val.content}</p>`);
                        }
                        else if (val.receiverID == res.currentUSER) {
                            //console.log("RECEIVED MESSAGES " + val.content);
                            $(".receiver").prepend(`<p>${val.content}</p>`);
                            //$(".message_history").append(`<p class="text-left">${val.content}</p>`);

                        }
                    }
                }
                else{
                    toastr.error(res.message);
                }
            },
            error: function (err) {
                alert(res.message);
            }
        })
    }
});
