
$(document).ready(function () {

    //when user access the '/message' page hide searching and sorting option of list-post 
    $(".reported").hide();

    //when page load an ajax request is called to display the count of total unread messages
    $.ajax({
        type: "get",
        url: '/messages',
        async: true,
        success: function (res) {

            //success response of ajax request will set the count of total unread message of particular user
            if (res.type == 'success') {
                toastr.success("Chatting Window Opened");
                for (let val of res.data) {
                    $(`#c${val._id}`).text(val.count);
                    $(`#c${val._id}`).attr("data-count", val.count);
                }
            }

            //error response of ajax request will displays the error to user using toastr
            else {
                toastr.error(res.message);
            }
        },
        error: function (err) {
           alert(res.message);
        }
    });

    $(".chatting").on('click', function () {

        $(".chatbox").html('');

        //on click of particular user => opens the chatbox of that user and send message fields 
        $(".chatbox").attr("hidden", false);
        $(".message").attr("hidden", false);

        //chatbox prepand the clicked user's user name to identify 
        // which user's chat is opened

        $(".chatbox").prepend(`
        <center><h1><p>Chat With ${$(this).text()}</p><h1></center>
        `);
        //set the id attribute of that chatbox and message button with user's "_id"
        $(".chatbox").attr("id", $(this).attr("id"));
        $(".message").attr("data-receiver", $(this).attr("id"));

        //descrease the unread chat count by one when current logged-in user read another user's unread chat 
        let countMessage = $(`#message-count`).text();
        if (countMessage > 0) {
            countMessage--;
            $(`#message-count`).text(countMessage);
        }
        //call getMessageContents to show previous chat of that user with current loggedIn user
        getMessageContents(`/messages/${$(this).attr("id")}/get`);

    });

    //if user press 'Enter' key than sendMessage function will call
    $(".content").keyup(function (event) {
        if (event.keyCode === 13) {
            sendMessage();
        }
    });

    //when user click on send message button than sendMessage will call
    $(".send").on("click", function () {
        sendMessage();
    });

    /**
     * sendMessage function sent an ajax request to store send message in messages collection
     */
    function sendMessage() {

        //trim the typed messge by user
        const content = $(".content").val().trim();

        //check if message content is something than append that content in chatbox in sender side
        if (content) {
            $(".chatbox").append(`<p align="right">
                                    ${content}
                                </p>`);

            //creating data object which send along with the ajax request 
            //data object consiste the original message and receiver id
            const data = {
                "content": content,
                "receiver": $(".message").attr("data-receiver")
            }

            //ajax call to store the message in message collection
            $.ajax({
                type: "post",
                url: "/messages",
                data: data,
                success: function (res) {
                    //on success response of ajax request a toastr will display "message sent successfully"
                    if (res.type == 'success') {
                        toastr.success(res.message);
                        return
                    }
                    toastr.error(res.message);
                },
                error: function (err) {
                    console.log(err.toString());
                }
            })
            $(".content").val("");
        }
        //if message content is nothing than toastr that "type something"

        else {
            toastr.info("Please Type message...");
        }
    };


    //getMessageContents function fetches previous chat of the current loggedIn user
    function getMessageContents(url) {
        $.ajax({
            type: "get",
            url: url,
            async: true,
            success: function (res) {
                if (res.type == 'success') {
                    toastr.success("ChatBox Opened");
                    for (let val of res.data) {

                        //if fetched message is received by login user than append that message in receiver side
                        if (val.receiverID == res.currentUSER) {
                            $(".chatbox").append(`
                                                <p align="left">
                                                ${val.content}
                                                </p>
                                                `);
                        }

                        //else if fetched message is send by login user than append that message in sender side
                        else if (val.senderID == res.currentUSER) {
                            $(".chatbox").append(`
                                                <p align="right">
                                                ${val.content}
                                                </p>
                                                `);
                        }
                    }
                }
                else {
                    toastr.error(res.message);
                }
            },
            error: function (err) {
                alert(res.message);
            }
        })
    }
});
