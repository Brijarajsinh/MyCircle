function resendVerifyMail() {
    $('#view-modal').modal('toggle');
    $.ajax({
        type: "put",
        url: `/users/resend-verify-mail`,
        success: function (res) {
            if (res.type == 'error') {
                toastr.error(res.message);
            }
            else {
                toastr.success("Verification link resent by MyCircle, Please verify from Your Inbox");
            }
        },
        error: function (err) {
            console.log(err.toString());
        }
    })
}
$(document).ready(function () {

    //on click of close button toggle the edit-modal from on to off
    $(".close-user-edit").on('click', function () {
        $('#edit-modal').modal('toggle');
    });


    //on click of view profile an ajax request is sent with get method
    $("#view").on('click', function () {
        $.ajax({
            type: "get",
            url: '/users/edit',
            success: function (res) {

                //success response of ajax request will open a modal which displays the current loggedIn user's details
                if (res.type == 'success') {
                    $("#user-image").html(`<img src=/images/user_images/${res.data.profile} style=height:250px width:250px; />`);
                    $("#user-fname").html(`<h2>${res.data.fname}</h2>`);
                    $("#user-lname").html(`<h2>${res.data.lname}</h2>`);
                    $("#user-email").html(`<h2>${res.data.email}</h2>`);
                    $("#user-gender").html(`<h2>${res.data.gender}</h2>`);

                    //if current logged in user is verified than shows that he/she is verified
                    if (res.data.isVerified) {
                        $("#user-status").html(`<h2 class=text-info>You Are Verified</h2><img class="rounded-circle" src=/images/verified.jpeg style=height:100px />`)
                    }

                    //else enable button which resend verification email to the user
                    else {
                        $("#user-status").html(`<h2 class=text-info>You Are Not Verified</h2>
                            <button type="button" class="btn btn-primary Resend-mail" onclick="resendVerifyMail()" id="${res.data.email}">Resend-mail</button>
                            `);
                    }
                    $('#view-modal').modal('toggle');
                }
                else {
                    alert(res.message);
                }
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    })
    
    //on click of edit profile an ajax request is sent with get method
    $("#edit").on('click', function () {
        $.ajax({
            type: "get",
            url: '/users/edit',
            success: function (res) {
                if (res.type == 'success') {

                    //on success response of ajax request fill the form with the current details and 
                    //opens the modal which contains edit-form
                    $("#fname").val(res.data.fname);
                    $("#lname").val(res.data.lname);
                    $("#email").val(res.data.email);
                    $(`input:radio[value=${res.data.gender}]`).attr('checked', 'checked');
                    $("#gender").val(res.data.fname);
                    $('#edit-modal').modal('toggle');
                }
                else {
                    alert(res.message);
                }
            },
            error: function (err) {
                console.log(err.toString());
            }
        })
    });
    $("#edit-form").validate({
        keypress: true,
        rules: {
            "fname": {
                required: true
            },
            "lname": {
                required: true
            },
            "gender": {
                required: true
            },
            "files": {
                extension: "jpg|jpeg|png"
            }
        },
        messages: {
            "fname": {
                required: 'First Name is Required'
            },
            "lname": {
                required: 'Last Name is Required'
            },
            "gender": {
                required: 'Select Gender'
            },
            "files": {
                extension: "Please Upload .jpg,.jpeg or .png file"
            }
        },

        //on submit of edit-form an ajax request sent to update user details in db with the edited details of user
        submitHandler: function () {
            var formData = new FormData();
            formData.append('fname', $("#fname").val().trim());
            formData.append('lname', $("#lname").val().trim());
            formData.append('email', $("#email").val().trim());
            formData.append('gender', $('input[type=radio]').val());
            formData.append('files', $("#file")[0].files[0]);
            $.ajax({
                type: "put",
                url: '/users/profile',
                data: formData,
                contentType: false,
                processData: false,
                success: async function (res) {
                    //on success response of ajax request edit-modal toggles 
                    //and reload the page which shows effect of user details changed
                    if (res.type == 'success') {
                        let url = '/?';
                        const filter = $(".filter").val();
                        if (filter == "arch") {
                            url += `arch=1&`
                        }
                        else {
                            url += `filter=${filter}&`
                        }
                        $('#edit-modal').modal('toggle');
                        toastr.success("User's Details edited");
                        window.location.href = `/?url`;
                    }
                    else {
                        alert(res.message);
                    }
                },
                error: function (err) {
                    console.log(err.toString());
                }
            })
        }
    })
});