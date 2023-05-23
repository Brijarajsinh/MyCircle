function myFunction() {
    $('#viewModal').modal('toggle');
    let email = $(".Resend-mail").attr("id");
    $.ajax({
        type: "post",
        url: `/registration/?email=${email}&verify=1`,
        success: function (res) {
            if (res.type == 'error') {
                toastr.error("Can't Send Mail for verification");
            }
            else {
                toastr.success("Check Your Inbox");
            }
        },
        error: function (err) {
            console.log(err.toString());
            
            
        }
    })
}
$(document).ready(function () {

    $(".closeUserEdit").on('click', function () {
        $('#editModal').modal('toggle');
    });

    $("#view").on('click', function () {
        $.ajax({
            type: "get",
            url: '/users/edit',
            success: function (res) {
                if (res.type == 'success') {
                    $("#userImage").html(`<img src=/images/user_images/${res.data.profile} />`);
                    $("#userFname").html(`<h2>${res.data.fname}</h2>`);
                    $("#userLname").html(`<h2>${res.data.lname}</h2>`);
                    $("#userEmail").html(`<h2>${res.data.email}</h2>`);
                    if (res.data.isVerified) {
                        $("#userStatus").html(`<h2 class=text-info>You Are Verified</h2><img class="rounded-circle" src=/images/verified.jpeg style=height:100px />`)
                    }
                    else {
                            $("#userStatus").html(`<h2 class=text-info>You Are Not Verified</h2>
                            <button type="button" class="btn btn-primary Resend-mail" onclick="myFunction()" id="${res.data.email}">Resend-mail</button>
                            `);

                    }
                    $("#userGender").html(`<h2>${res.data.gender}</h2>`);
                    $('#viewModal').modal('toggle');
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

    $("#edit").on('click', function () {
        $.ajax({
            type: "get",
            url: '/users/edit',
            success: function (res) {
                if (res.type == 'success') {
                    $("#fname").val(res.data.fname);
                    $("#lname").val(res.data.lname);
                    $("#email").val(res.data.email);
                    $(`input:radio[value=${res.data.gender}]`).attr('checked', 'checked');
                    $("#gender").val(res.data.fname);
                    $('#editModal').modal('toggle');
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
    $("#EditForm").validate({
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
        submitHandler: function () {
            var formData = new FormData();
            formData.append('fname', $("#fname").val().trim());
            formData.append('lname', $("#lname").val().trim());
            formData.append('email', $("#email").val().trim());
            formData.append('gender', $('input[type=radio]').val());
            formData.append('files', $("#file")[0].files[0]);
            $.ajax({
                type: "put",
                url: './users/',
                data: formData,
                contentType: false,
                processData: false,
                success: async function (res) {
                    if (res.type == 'success') {
                        let url = '/?';
                        var filter = $(".filter").val();
                        if (filter == "arch") {
                            url += `arch=1&`
                        }
                        else {
                            url += `filter=${filter}&`
                        }
                        $('#editModal').modal('toggle');
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