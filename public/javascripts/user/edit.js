$(document).ready(function () {
    $(".closeUserEdit").on('click', function () {
        $('#editModal').modal('toggle');
    });
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
            formData.append('fname', $("#fname").val());
            formData.append('lname', $("#lname").val());
            formData.append('email', $("#email").val());
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